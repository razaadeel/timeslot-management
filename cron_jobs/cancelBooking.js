const cron = require('node-cron');
const db = require('../models/index.js');

// cancelling booking of new users who have not uploaded a video in 15 days
cron.schedule('0 8 * * *', async () => {
    try {
        await db.BookedSlot.canncelBookingNoVideo();
    } catch (error) {
        console.log('Error in cron job ===> cancelBooking');
        console.log(error);
    }
});


// cancelling booking of old users who have not uploaded a video new video
cron.schedule('0 9 * * *', async () => {
    try {
        await db.BookedSlot.canncelBookingWithVideo();
    } catch (error) {
        console.log('Error in cron job ===> cancelBooking');
        console.log(error);
    }
});