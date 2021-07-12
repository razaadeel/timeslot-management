const cron = require('node-cron');
const db = require('../models/index.js');

cron.schedule('0 8 * * *', async () => {
    try {
        await db.BookedSlot.canncelBookingNoVideo();
    } catch (error) {
        console.log('Error in cron job ===> cancelBooking');
        console.log(error);
    }
});