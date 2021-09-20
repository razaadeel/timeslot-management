const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');


const db = require('../models');
const chargify = require('../services/chargify');
const mailgun = require('../services/mailgun');
const slack = require('../utils/slack_logs');
const leaddyno = require('../services/leaddyno');
const mediacp = require('../services/mediacp');

exports.createUser = async (req, res) => {
    try {
        let {
            firstName, lastName,
            email, password, cityId,
            dayId, timeslotId, showName,
            showDescription, addon,
            slotExpansion, organizationName,
            website, phoneNumber,
            offcialTitle, officialFirstName,
            officialLastName, candidateFirstName,
            candidateLastName,
            chargify_customerId, chargify_subscriptionId,
            bubbleId
        } = req.body;
        let { channelId } = req.params;

        //checking if email is already exists
        let emailExists = await db.User.checkEmail(email);
        if (emailExists) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt)

        let user = await db.User.createUser({ firstName, lastName, email, password, bubbleId, chargify_customerId, chargify_subscriptionId });

        //Saving user booking 
        let booking = await db.BookedSlot.saveBooking({ channelId, cityId, dayId, timeslotId, userId: user.id });
        let bookingDetails = await db.BookedSlot.getBookingDetails(booking.id);

        //spliting name into first and last name
        let userName = bookingDetails.userName.split(' ');
        bookingDetails.firstName = userName[0];
        bookingDetails.lastName = userName[1];

        let startTime = `${bookingDetails.startTime}`.split(':');
        let endTime = `${bookingDetails.endTime}`.split(':');
        //below if else conditions are for making timeslots in 12hrs format
        if (Number(startTime[0]) >= 12) {
            if (startTime[0] != 12) startTime[0] = startTime[0] - 12
            startTime = `${startTime[0]}:${startTime[1]}pm`
        } else {
            startTime = `${startTime[0]}:${startTime[1]}am`
        }
        if (Number(endTime[0]) > 11) {
            if (endTime[0] != 12) endTime[0] = endTime[0] - 12
            endTime = `${endTime[0]}:${endTime[1]}pm`
        } else {
            if (endTime[0] == '00') endTime[0] = '12'
            endTime = `${endTime[0]}:${endTime[1]}am`
        }

        bookingDetails.timeslot = `${startTime} - ${endTime}`;

        await db.BookedSlot.saveCustomerInfo({
            ...bookingDetails,
            showName, showDescription,
            organizationName, email,
            addon: addon ? addon : 'no',
            slotExpansion: slotExpansion ? slotExpansion : 'no',
            website, phoneNumber,
            offcialTitle, officialFirstName,
            officialLastName, candidateFirstName,
            candidateLastName
        });

        //sending response
        res.json({ message: 'successful', userId: user.id });

        //Converting time according to city timzone; base timezone is America/New_York
        let t1 = moment.tz("America/New_York").format(); //this will give current date and time with timezone
        let currentDate = t1.split('T')[0]; // extracting only current date
        let utc = t1.split('T')[1].split('-')[1]; // extracting utc timezone 
        let sTime = bookingDetails.startTime.split(':')[0] >= 12 ? bookingDetails.startTime : `0${bookingDetails.startTime}`;
        sTime = moment.tz(`${currentDate}T${sTime}-${utc}`, bookingDetails.timezone).format("hh:mm A");
        let eTime = bookingDetails.endTime.split(':')[0] >= 12 ? bookingDetails.endTime :
            bookingDetails.endTime === '00:00' ? bookingDetails.endTime : `0${bookingDetails.endTime}`;
        eTime = moment.tz(`${currentDate}T${eTime}-${utc}`, bookingDetails.timezone).format("hh:mm A");

        //sending slack alert for new slot booking
        slack.newUserMsg({
            userId: user.id,
            email: email,
            city: bookingDetails.cityName,
            state: bookingDetails.stateName,
            day: bookingDetails.day,
            timeslot: `${sTime} - ${eTime}`,
            channel: bookingDetails.channelName,
            showName: showName
        });

        //sending email alert for new slot booking
        mailgun.sendEmail('newUser', {
            userId: user.id,
            email: email,
            city: bookingDetails.cityName,
            state: bookingDetails.stateName,
            day: bookingDetails.day,
            timeslot: `${sTime} - ${eTime}`,
            channel: bookingDetails.channelName,
            showName: showName
        });

        //Checking if city channels are created in mediacp
        let channels = await db.CityChannelStatus.getCityChannels(cityId);
        if (channels) {
            let body = {
                city: bookingDetails.cityName,
                state: bookingDetails.stateName,
                stateCode: bookingDetails.stateCode,
                channels
            }

            // creating channel
            mediacp.createChannel(body);

            // updating city channel status in db
            await db.CityChannelStatus.updateChannelStatus(cityId);

            //Example hsl url https://5e1d043cba697.streamlock.net:443/nv-testcity-community/nv-testcity-community/playlist.m3u8
            //updating hsl url in "CityChannelStatus" table for each channel that is created 
            body.channels.forEach(async channel => {
                let cityName = body.city;
                cityName = cityName.split(' ').join('').toLowerCase();
                let channelName = `${(body.stateCode).toLowerCase() + '-' + cityName + '-' + (channel.channelName).toLowerCase()}`
                channelName = channelName.split(' ');
                channelName = channelName[0];

                let HLS_URL = `https://5e1d043cba697.streamlock.net:443/${channelName}/${channelName}/playlist.m3u8`;
                await db.CityChannelStatus.updateChannelHslUrl(cityId, channel.channelName, HLS_URL);
            });
        }

        // //checking if user has referral code
        // if (chargify_customerId) {
        //     let metadata = await chargify.getCustomerMetadata(chargify_customerId);
        //     let referralObj = metadata.find(obj => obj.name === 'Referral Code');
        //     if (referralObj) {

        //         //geting user subscription type
        //         let subscription = await chargify.getCustomerSubscription(chargify_customerId);

        //         //create a customer in leaddyno if subscription is "ads removed"
        //         if (subscription.handle.includes('ads_removed')) {
        //             leaddyno.createLead(email, referralObj.value);
        //         }
        //     }
        // }

        return true

    } catch (error) {
        console.log(error);
        // console.error(error, 'Error while creating new user');
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

//Updating user status when user verified his email
exports.updateUserStatus = async (req, res) => {
    try {
        let { userId, status } = req.body;
        await db.User.updateStatus(userId, status);
        res.json({ message: 'Successfully updated user status.' })
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

// register user from email and password (comming from bubble.io)
exports.signup = async (req, res) => {
    try {
        console.log('working')
        console.log(req.body)
        // let {
        //     email, password,
        //     chargify_customerId, chargify_subscriptionId,
        // } = req.body;

        // //checking if email is already exists
        // let emailExists = await db.User.checkEmail(email);
        // if (emailExists) {
        //     return res.status(409).json({ message: 'Email already exists' });
        // }
        // const salt = await bcrypt.genSalt(10);
        // password = await bcrypt.hash(password, salt);

        // let user = await db.User.createUser({ email, password, chargify_customerId, chargify_subscriptionId });

        return res.json({ msg: 'success' });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: 'internal server error' });
    }
}

// 
exports.getUserByEmail = async (req, res) => {
    try {
        let { email } = req.body;
        let user = await db.User.userByEmail(email);
        return res.render('pages/UploadVideoPage', { user });
    } catch (error) {
        console.log(error)
        res.redirect('/video-auth?error=' + encodeURIComponent(error.message));
        return false;
        // return res.status(500).json({
        //     message: "Something went wrong"
        // });
    }
}

exports.getBillingPortal = async (req, res) => {
    try {
        let { email } = req.body;
        let user = await db.User.userByEmail(email);
        if (user.chargifyCustomerId) {
            let portalURL = await chargify.getBillingPortalLink(user.chargifyCustomerId);
            return res.redirect(portalURL);
        } else {
            res.redirect('/auth-billing-portal?error=User not registered on Chargify');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/auth-billing-portal?error=' + encodeURIComponent(error.message));
        return false;
        // return res.status(500).json({
        //     message: "Something went wrong"
        // });
    }
}