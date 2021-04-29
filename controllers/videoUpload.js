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

                let userBooking = await db.BookedSlot.getBookingByUserId(userId);
                let day = userBooking.day.slice(0, 3);
                let slotTime = `${userBooking.startTime}`.split(':');
                slotTime = `${slotTime[0]}${slotTime[1]}`;

                const destination = `stv-curated-data/${userBooking.stateCode}/${userBooking.cityName}/${userBooking.channelName}/${day}/${slotTime}`;
                
                res.json({ videoName });

                //sending file for transcoding
                transocde(videoLocation, destination);
                return true;
            }
        }
    });
}