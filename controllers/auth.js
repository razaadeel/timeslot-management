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
            email, cityId,
            dayId, timeslotId, showName,
            showDescription, addon,
            slotExpansion, organizationName,
            website, phoneNumber,
            offcialTitle, officialFirstName,
            officialLastName, candidateFirstName,
            candidateLastName,
            chargify_customerId, chargify_subscriptionId
        } = req.body;
        let { channelId } = req.params;

        //checking if email is already exists
        let emailExists = await db.User.checkEmail(email);
        if (emailExists) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        let user = await db.User.createUser({ firstName, lastName, email, chargify_customerId, chargify_subscriptionId });

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

        //sending slack alert for new slot booking
        slack.newUserMsg({
            userId: user.id,
            email: email,
            city: bookingDetails.cityName,
            state: bookingDetails.stateName,
            timeslot: `${startTime} - ${endTime}`,
            channel: bookingDetails.channelName
        });

        //sending email alert for new slot booking
        mailgun.sendEmail('newUser', {
            userId: user.id,
            email: email,
            city: bookingDetails.cityName,
            state: bookingDetails.stateName,
            timeslot: `${startTime} - ${endTime}`,
            channel: bookingDetails.channelName
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

                let HSL_URL = `https://5e1d043cba697.streamlock.net:443/${channelName}/${channelName}/playlist.m3u8`;
                await db.CityChannelStatus.updateChannelHslUrl(cityId, channel.channelName, HSL_URL);
            });
        }

        //checking if user has referral code
        if (chargify_customerId) {
            let metadata = await chargify.getCustomerMetadata(chargify_customerId);
            let referralObj = metadata.find(obj => obj.name === 'Referral Code');
            if (referralObj) {

                //geting user subscription type
                let subscription = await chargify.getCustomerSubscription(chargify_customerId);

                //create a customer in leaddyno if subscription is "ads removed"
                if (subscription.handle.includes('ads_removed')) {
                    leaddyno.createLead(email, referralObj.value);
                }
            }
        }

        return res.json('successful');

    } catch (error) {
        console.log(error);
        console.error(error, 'Error while creating new user');
        return res.status(500).json({
            message: "Something went wrong"
        });
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