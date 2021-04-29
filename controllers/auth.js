const db = require('../models');

exports.createUser = async (req, res) => {
    try {
        let {
            firstName,
            lastName,
            email,
            cityId,
            dayId,
            timeslotId,
            showName,
            showDescription,
            addon,
            slotExpansion,
            organizationName,
            website,
            phoneNumber,
        } = req.body;
        let { channelId } = req.params;

        //checking if email is already exists
        let emailExists = await db.User.checkEmail(email);
        if (emailExists) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        let user = await db.User.createUser({ firstName, lastName, email });

        // //Saving user booking 
        let booking = await db.BookedSlot.saveBooking({ channelId, cityId, dayId, timeslotId, userId: user.id });

        let bookingDetails = await db.BookedSlot.getBookingDetails(booking.id);

        // //spliting name into first and last name
        let userName = bookingDetails.userName.split(' ');
        bookingDetails.firstName = userName[0];
        bookingDetails.lastName = userName[1];
        bookingDetails.timeslot = `${bookingDetails.startTime} - ${bookingDetails.endTime}`;

        await db.BookedSlot.saveCustomerInfo({
            ...bookingDetails,
            showName,
            showDescription,
            organizationName,
            email,
            addon: addon ? addon : 'no',
            slotExpansion: slotExpansion ? slotExpansion : 'no',
            website,
            phoneNumber
        });

        return res.json('working');

    } catch (error) {
        console.log(error);
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
        console.log(error);
        return res.redirect('/video-auth');
        // return res.status(500).json({
        //     message: "Something went wrong"
        // });
    }
}