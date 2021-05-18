const db = require('../models');

const s3Upload = require('../services/videoUpload');
const transocde = require('../services/qencode');



exports.uploadVideo = async (req, res) => {
    // service created to upload videos to aws s3
    s3Upload(req, res, async (error) => {
        if (error) {
            console.log('errors', error);
            return res.status(400).json({ error: error });
        } else {
            // If File not found
            if (req.file === undefined) {
                console.log('Error: No File Selected!');
                return res.status(400).json('Error: No File Selected');
            } else {
                // If Success
                const videoName = req.file.key;
                const videoLocation = req.file.location;

                let userId = req.body.userId;
                let user = await db.User.userById(userId);

                let userBooking = await db.BookedSlot.getBookingByUserId(userId);

                //below call for getting data for showName
                let channelName = `${userBooking.channelName}`.split(' ');
                channelName = channelName[0];
                let bookingDetails = await db.BookedSlot.getBookingDetailsByEmail(user.email, channelName);

                let day = userBooking.day.slice(0, 3); //Reducing day to 3 letters i.e Monday to Mon

                let slotTime = `${userBooking.startTime}`.split(':');
                if (Number(slotTime[0]) < 10) slotTime[0] = `0${slotTime[0]}`;
                slotTime = `${slotTime[0]}${slotTime[1]}`;

                const destination = `stv-curated-data/${userBooking.stateCode}/${userBooking.cityName}/${userBooking.channelName}/${day}/${slotTime}`;
                const outputVideoName = `${bookingDetails.showName}-${userId}-28-a-[adins].mp4`
                res.json({ videoName });

                //sending file for transcoding
                transcode(videoLocation, destination, outputVideoName);
                return true;
            }
        }
    });
}