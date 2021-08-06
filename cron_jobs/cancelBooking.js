const cron = require('node-cron');
const db = require('../models/index.js');

cron.schedule('0 8 * * *', async () => {
    try {
        // cancelling booking of new users who have not uploaded a video in 15 days
        await db.BookedSlot.canncelBookingNoVideo();

        // If user did not verify his email in 24 hrs
        //Updating user status to 3 (suspended) and updating "isActive" (BookedSlots) to false
        await db.User.suspendUser();
    } catch (error) {
        console.log('Error in cron job ===> cancelBooking at', Date.now());
        console.log(error);
    }
});


cron.schedule('0 9 * * *', async () => {
    try {
        // cancelling booking of old users who have not uploaded a video new video in 15 days
        await db.BookedSlot.canncelBookingWithVideo();
    } catch (error) {
        console.log('Error in cron job ===> cancelBooking at', Date.now());
        console.log(error);
    }
});