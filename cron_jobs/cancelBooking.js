const cron = require('node-cron');
const db = require('../models/index.js');
const axios = require('axios');

const env = process.env.NODE_ENV || 'development';
const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js') //import in dev 
    : require(__dirname + '/../config/config.js'); // imp in production

cron.schedule('57 16 * * *', async () => {
    try {
        // cancelling booking of new users who have not uploaded a video in 15 days
        await db.BookedSlot.canncelBookingNoVideo();

        // If user did not verify his email in 24 hrs
        //Updating user status to 3 (suspended) and updating "isActive" (BookedSlots) to false
        // it will return ids of updated users
        let udpatedUsers = await db.User.suspendUser();
        updateBubbleUser(udpatedUsers);
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

const updateBubbleUser = async (userIds) => {
    try {
        console.log(userIds);
        userIds = userIds.map(item => item.userId);
        console.log(userIds);
        let users = await db.User.getBubbleIds(userIds);
        let body = {
            signup_step_number: 1
        }

        let api_token = config.bubbleApiToken;
        users.forEach(async user => {
            await axios.patch(`https://citystvsignup.com/version-test/api/1.1/obj/user/${user.bubbleId}?api_token=${api_token}`, body);
        });
    } catch (error) {
        console.log(error)
    }
}