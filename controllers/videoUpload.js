const db = require('../models');

const s3 = require('../services/aws-s3');
const chargify = require('../services/chargify');
const transcode = require('../services/qencode');
const mailgun = require('../services/mailgun');
const slack = require('../utils/slack_logs');

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

                    //saving video data to ContentVideoUpload
                    db.ContentVideoUpload.saveVideoDetails({
                        inputName: req.file.key,
                        outputName: outputVideoName,
                        destination: destination
                    });

                    //sending email alert for video upload
                    mailgun.sendEmail('contentVideoUpload', {
                        email: user.email,
                        inputName: req.file.key,
                        outputName: outputVideoName,
                        destination: destination
                    });

                    //sending slack alert for video upload
                    slack.videoUploadMsg({
                        email: user.email,
                        inputName: req.file.key,
                        outputName: outputVideoName,
                        destination: destination
                    });

                    //sending response to front end for video upload
                    res.json({ message: 'successful' });

                    let channel = await db.CityChannelStatus.getChannelStatus(userBooking.cityId, userBooking.channelName);
                    if (channel) {
                        if (channel.scheduling === 'automated') {
                            //sending file for transcoding for automated system
                            transcode.automatedSystem(videoLocation, destination, outputVideoName);

                            // for uploading crawl file to aws
                            s3.fileUpload(bookingDetails.showName, destination);

                        } else {
                            //sending file for transcoding for manual system
                            transcode.manualSystem(videoLocation, destination, outputVideoName, userId);
                        }
                    } else {

                        //if channel is not found in "CityChannelStatus" (table)
                        // temporary we are sending them to manual system
                        transcode.manualSystem(videoLocation, destination, outputVideoName, userId);
                    }

                    return true;
                }
            }
        });

    } catch (error) {
        console.log(error)
        console.error(error, 'Error in video upload route');;
        return res.status(401).json({ message: 'something went wrong' });
    }
}

// callback route controller for quencode
exports.qencodeRequest = async (req, res) => {
    try {

        let status = JSON.parse(req.body.status);
        if (status.error == 0 && req.body.event === 'saved') {
            // //spliting destination string to get state,city,channel
            // let adsBucket = req.query.destination.split('/');

            // //Creating Ads bucket 'location' for particular state,city,channel
            // adsBucket = `${adsBucket[0]}/${adsBucket[1]}/${adsBucket[2]}/Ads/`;

            // //getting all ads from bucket
            // let adsObjects = await s3.getBucketObjects(adsBucket);

            //getting ads from temporary bucket
            // let adBucket = 'temporary-ads-run/ads/';
            // let randomNum = Math.floor(Math.random() * 2);
            // let adsObjects = await s3.getBucketObjects('temporary-ads-run/ads/');

            //selecting random bucket i.c '30' or '60'
            let firstAdSlot = [];
            let secondAdSlot = [];
            for (let i = 0; i < 2; i++) {
                let adBucket = 'ads/';

                // let adSlotNum = 1;
                let adSlotNum = Math.floor(Math.random() * 2);

                if (adSlotNum === 1) {
                    adBucket = adBucket + '60/'
                } else {
                    adBucket = adBucket + '30/'
                }
                let adsObjects = await s3.getBucketObjects(adBucket);

                //removing first element (1st element is folder root)
                adsObjects.splice(0, 1);

                //picking video randomly from adsObject
                if (adSlotNum === 1) {
                    if (i === 0) {
                        let adNum1 = Math.floor(Math.random() * adsObjects.length);
                        firstAdSlot.push(adsObjects[adNum1]);
                    } else {
                        let adNum1 = Math.floor(Math.random() * adsObjects.length);
                        while (firstAdSlot.some(item => item.Key === adsObjects[adNum1].Key)) {
                            adNum1 = Math.floor(Math.random() * adsObjects.length);
                        }
                        secondAdSlot.push(adsObjects[adNum1]);
                    }

                } else {
                    if (i === 0) {
                        let adNum1 = Math.floor(Math.random() * adsObjects.length);
                        firstAdSlot.push(adsObjects[adNum1]);
                        let adNum2 = Math.floor(Math.random() * adsObjects.length);
                        while (adNum2 === adNum1) {
                            adNum2 = Math.floor(Math.random() * adsObjects.length);
                        }
                        firstAdSlot.push(adsObjects[adNum2]);
                    } else {
                        let adNum1 = Math.floor(Math.random() * adsObjects.length);
                        while (firstAdSlot.some(item => item.Key === adsObjects[adNum1].Key)) {
                            adNum1 = Math.floor(Math.random() * adsObjects.length);
                        }
                        secondAdSlot.push(adsObjects[adNum1]);
                        let adNum2 = Math.floor(Math.random() * adsObjects.length);
                        while (
                            firstAdSlot.some(item => item.Key === adsObjects[adNum2].Key)
                            || secondAdSlot.some(item => item.Key === adsObjects[adNum2].Key)
                        ) {
                            adNum2 = Math.floor(Math.random() * adsObjects.length);
                        }
                        secondAdSlot.push(adsObjects[adNum2]);
                    }
                }
            }

            let destination = req.query.destination;
            let splitDestination = destination.split('/');
            let state = splitDestination[1].toLowerCase();
            let city = splitDestination[2].split(' ').join('').toLowerCase();
            let channel = splitDestination[3].toLowerCase() === 'public' ? 'entertainment' : splitDestination[3].toLowerCase();
            channel.split(' ').join('')
            let ftp = {
                ftpURL: 'mediastreamingcp.com:2121',
                ftpUsername: `w1s_${state}-${city}-${channel}@162.244.81.156`,
                secret: '654321'
            }

            //sending video for stitching
            transcode.stitchVideos(req.query.destination, ftp, req.query.outputvideoname, firstAdSlot, secondAdSlot);
            res.json({ message: 'success' });
        }
        if (status.error != 0) {
            throw new Error('Error while transcoding video');
        }
    } catch (error) {
        console.log(error)
        console.error(error, 'Qencode');;
        return res.status(401).json({ message: 'something went wrong' });
    }
}


//ADS upload controller
exports.uploadAdVideo = async (req, res) => {
    try {
        // service created to upload videos to wasabi s3
        s3.videoAdUpload(req, res, async (error) => {
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
                    const videoDuration = req.body.duration;

                    let outputVideoName = `${videoName}-${videoDuration}.mp4`
                    res.json({ message: 'successful' });

                    //sending file for transcoding
                    transcode.uploadAds(videoLocation, outputVideoName, videoDuration);

                    return true;
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'something went wrong' });
    }
}


exports.uploadVideoMediaConvert = async (req, res) => {
    try {
        req.destination = 'AL/Albertville/Community/Mon/0700'
        s3.mediaConvertUpload(req, res, async (error) => {
            if (error) {
                console.log('errors', error);
                return res.status(400).json({ error: error });
            } else {
                // If File not found
                if (req.file === undefined) {
                    console.log('Error: No File Selected!');
                    return res.status(400).json('Error: No File Selected');
                } else {
                    res.json({ message: 'success' })
                }
            }
        });
        // res.json({ message: 'success', body: req.body })

        // // service created to upload videos to aws s3
        // let userId = req.body.userId;
        // let user = await db.User.userById(userId);

        // let userBooking = await db.BookedSlot.getBookingByUserId(userId);

        // //below call for getting data for showName
        // let channelName = `${userBooking.channelName}`.split(' ');
        // channelName = channelName[0];
        // let bookingDetails = await db.BookedSlot.getBookingDetailsByEmail(user.email, channelName);

        // let day = userBooking.day.slice(0, 3); //Reducing day to 3 letters i.e Monday to Mon

        // let slotTime = `${userBooking.startTime}`.split(':');
        // if (Number(slotTime[0]) < 10) slotTime[0] = `0${slotTime[0]}`;
        // slotTime = `${slotTime[0]}${slotTime[1]}`;

        // let destination;
        // if (userBooking.channelName === 'Entertainment') {
        //     //Entertainment channel is named as public in s3 bucket
        //     destination = `stv-curated-data/${userBooking.stateCode}/${userBooking.cityName}/Public/${day}/${slotTime}`;

        // } else if (userBooking.channelName === 'Elected Officials') {
        //     // Elected Officials channel is named as Elected in s3 bucket
        //     destination = `stv-curated-data/${userBooking.stateCode}/${userBooking.cityName}/Elected/${day}/${slotTime}`;

        // } else {
        //     destination = `stv-curated-data/${userBooking.stateCode}/${userBooking.cityName}/${userBooking.channelName}/${day}/${slotTime}`;
        // }

        // let outputVideoName;
        // if (user.chargifyCustomerId) {

        //     //geting user subscription type
        //     let subscription = await chargify.getCustomerSubscription(user.chargifyCustomerId);

        //     //adding [adins] in outputVideoName if subscription is not "ads removed"
        //     if (subscription.handle.includes('ads_removed')) {
        //         outputVideoName = `${bookingDetails.showName}-${userId}-28-a.mp4`
        //     } else {
        //         outputVideoName = `${bookingDetails.showName}-${userId}-28-a-[adins].mp4`
        //     }

        // } else {
        //     outputVideoName = `${bookingDetails.showName}-${userId}-28-a-[adins].mp4`
        // }

        // req.destination = destination + '/' + outputVideoName;
        // s3.mediaConvertUpload(req, res, async (error) => {
        //     if (error) {
        //         console.log('errors', error);
        //         return res.status(400).json({ error: error });
        //     } else {
        //         // If File not found
        //         if (req.file === undefined) {
        //             console.log('Error: No File Selected!');
        //             return res.status(400).json('Error: No File Selected');
        //         } else {
        //             // If Success
        //             const videoName = req.file.key;
        //             const videoLocation = req.file.location;

        //             //saving video data to ContentVideoUpload
        //             db.ContentVideoUpload.saveVideoDetails({
        //                 userId,
        //                 inputName: req.file.key,
        //                 outputName: outputVideoName,
        //                 destination: destination
        //             });

        //             res.json({ message: 'successful' });

        //             //for uploading crawl file to aws
        //             s3.fileUpload(bookingDetails.showName, destination);
        //             return true;
        //         }
        //     }
        // });

    } catch (error) {
        console.log(error)
        console.error(error, 'Error in video upload route');;
        return res.status(401).json({ message: 'something went wrong' });
    }
}