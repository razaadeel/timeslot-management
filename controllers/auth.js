const db = require('../models');
const chargify = require('../services/chargify');
// const leaddyno = require('../services/leaddyno');

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

        return res.json('successful');

    } catch (error) {
        console.log(error)
        console.error(error, 'Error while creating new user');;
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
        console.error(error, 'Error while video auth');;
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
        console.log(error)
        console.error(error, 'Error while billing portal auth');
        res.redirect('/auth-billing-portal?error=' + encodeURIComponent(error.message));
        return false;
        // return res.status(500).json({
        //     message: "Something went wrong"
        // });
    }
}