const db = require('../models');

const s3 = require('../services/aws-s3');
const chargify = require('../services/chargify');

exports.uploadVideo = async (req, res) => {
    try {
        // service created to upload videos to aws s3
        s3.videoUpload(req, res, async (error) => {
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

                    let destination;
                    if (userBooking.channelName === 'Entertainment') {
                        //Entertainment channel is named as public in s3 bucket
                        destination = `stv-curated-data/${userBooking.stateCode}/${userBooking.cityName}/Public/${day}/${slotTime}`;

                    } else if (userBooking.channelName === 'Elected Officials') {
                        // Elected Officials channel is named as Elected in s3 bucket
                        destination = `stv-curated-data/${userBooking.stateCode}/${userBooking.cityName}/Elected/${day}/${slotTime}`;

                    } else {
                        destination = `stv-curated-data/${userBooking.stateCode}/${userBooking.cityName}/${userBooking.channelName}/${day}/${slotTime}`;
                    }

                    let outputVideoName;
                    if (user.chargifyCustomerId) {

                        //geting user subscription type
                        let subscription = await chargify.getCustomerSubscription(user.chargifyCustomerId);

                        //adding [adins] in outputVideoName if subscription is not "ads removed"
                        if (subscription.handle.includes('ads_removed')) {
                            outputVideoName = `${bookingDetails.showName}-${userId}-28-a.mp4`
                        } else {
                            outputVideoName = `${bookingDetails.showName}-${userId}-28-a-[adins].mp4`
                        }

                    } else {
                        outputVideoName = `${bookingDetails.showName}-${userId}-28-a-[adins].mp4`
                    }

                    res.json({ message: 'successful' });

                    //sending file for transcoding
                    transcode(videoLocation, destination, outputVideoName);

                    //for uploading crawl file to aws
                    s3.fileUpload(bookingDetails.showName, destination);
                    return true;
                }
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'something went wrong' });
    }
}