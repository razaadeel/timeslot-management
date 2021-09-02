const db = require('../models');

const s3 = require('../services/aws-s3');
const chargify = require('../services/chargify');
const transcode = require('../services/qencode');
const mailgun = require('../services/mailgun');
const slack = require('../utils/slack_logs');
const moment = require('moment');

const env = process.env.NODE_ENV || 'development';
const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js')//import in dev 
    : require(__dirname + '/../config/config.js'); // import in prod

//Video upload 
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
                            outputVideoName = `${bookingDetails.showName}-${userId}-28-a.mp4`;
                        } else {
                            outputVideoName = `${bookingDetails.showName}-${userId}-28-a-[adins].mp4`;
                        }

                    } else {
                        outputVideoName = `${bookingDetails.showName}-${userId}-28-a-[adins].mp4`
                    }

                    //saving video data to ContentVideoUpload
                    let videoData = await db.ContentVideoUpload.saveVideoDetails({
                        userId,
                        inputName: req.file.key,
                        outputName: outputVideoName,
                        destination: destination
                    });

                    //sending response to front end for video upload
                    res.json({ message: 'successful' });

                    let chn = userBooking.channelName === 'Entertainment' ? 'Ent' : userBooking.channelName;
                    let channel = await db.CityChannelStatus.getChannelStatus(userBooking.cityId, chn);

                    //sending email alert for video upload
                    mailgun.sendEmail('contentVideoUpload', {
                        email: user.email,
                        inputName: req.file.key,
                        outputName: outputVideoName,
                        destination: destination,
                        scheduling: channel.scheduling
                    });

                    //sending slack alert for video upload
                    slack.videoUploadMsg({
                        email: user.email,
                        inputName: req.file.key,
                        outputName: outputVideoName,
                        destination: destination,
                        scheduling: channel.scheduling
                    });

                    if (channel) {
                        if (channel.scheduling === 'automated') {
                            console.log(channel.scheduling);
                            //sending file for transcoding for automated system
                            transcode.automatedSystem(videoLocation, destination, outputVideoName);

                            // for uploading crawl file to aws
                            s3.fileUpload(bookingDetails.showName, destination);

                        } else {
                            //sending file for transcoding for manual system
                            transcode.manualSystem(videoLocation, destination, outputVideoName, userId, videoData.id);
                        }
                    } else {

                        //if channel is not found in "CityChannelStatus" (table)
                        // temporary we are sending them to manual system
                        transcode.manualSystem(videoLocation, destination, outputVideoName, userId, videoData.id);
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

// Video uploaded from bubble
exports.uploadVideoFromBubble = async (req, res) => {
    try {

        const videoName = req.body.videoName;
        const videoLocation = req.body.videoUrl;
        let userId = req.body.userId;
        let planId = req.body.planId; //user plan id

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

        //checking user plan for adding/removing adds
        let outputVideoName;
        //index 0=community, 1=entertainment, 2=candidate ,3=elected ,4=faith
        let plans = ['price_1JPXsxAvKKZkQiDeN6vpCPJJ', 'price_1ImDFKAvKKZkQiDevEUerm0g', 'price_1Iba7jAvKKZkQiDe805f52qA', 'price_1Iba76AvKKZkQiDevwPLCVXH', 'price_1Iba5cAvKKZkQiDenqyzd5ns'];

        if (plans.includes(planId)) {
            outputVideoName = `${bookingDetails.showName}-${userId}-28-a.mp4`;
        } else {
            outputVideoName = `${bookingDetails.showName}-${userId}-28-a-[adins].mp4`;
        }

        let dayValue = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        const dayINeed = dayValue[day];
        const today = moment().isoWeekday();
        let date;
        if (today < dayINeed) date = moment().isoWeekday(dayINeed).format("YYYY-MM-DD"); //If day is in current week
        else date = moment().add(1, 'weeks').isoWeekday(dayINeed).format("YYYY-MM-DD");
        let airDate = moment(date + ' ' + `${userBooking.startTime}`).format();

        //saving video data to ContentVideoUpload
        let videoData = await db.ContentVideoUpload.saveVideoDetails({
            userId,
            inputName: videoName,
            outputName: outputVideoName,
            destination: destination,
            airDate
        });

        // //sending response to front end for video upload
        res.json({ message: 'successful', airDate, userBooking });

        let chn = userBooking.channelName === 'Entertainment' ? 'Ent' : userBooking.channelName;
        let channel = await db.CityChannelStatus.getChannelStatus(userBooking.cityId, chn);

        //sending email alert for video upload
        mailgun.sendEmail('contentVideoUpload', {
            email: user.email,
            inputName: videoName,
            outputName: outputVideoName,
            destination: destination,
            scheduling: channel.scheduling
        });

        //sending slack alert for video upload
        slack.videoUploadMsg({
            email: user.email,
            inputName: videoName,
            outputName: outputVideoName,
            destination: destination,
            scheduling: channel.scheduling
        });

        if (channel) {
            if (channel.scheduling === 'automated') {
                console.log(channel.scheduling);
                //sending file for transcoding for automated system
                transcode.automatedSystem(videoLocation, destination, outputVideoName);

                // for uploading crawl file to aws
                s3.fileUpload(bookingDetails.showName, destination);

            } else {
                //sending file for transcoding for manual system
                transcode.manualSystem(videoLocation, destination, outputVideoName, userId, videoData.id);
            }
        } else {

            //if channel is not found in "CityChannelStatus" (table)
            // temporary we are sending them to manual system
            transcode.manualSystem(videoLocation, destination, outputVideoName, userId, videoData.id);
        }

        return true;
    } catch (error) {
        console.log(error)
        console.error(error, 'Error in video upload route');;
        return res.status(401).json({ message: 'something went wrong' });
    }
}

// callback route controller for quencode
exports.qencodeRequest = async (req, res) => {
    try {
        res.json({ message: 'success' });

        let status = JSON.parse(req.body.status);
        if (status.error == 0 && req.body.event === 'saved') {

            let destination = req.query.destination;
            let splitDestination = destination.split('/');
            let state = splitDestination[1].toLowerCase();
            let city = splitDestination[2].split(' ').join('').toLowerCase();
            let channel = splitDestination[3].toLowerCase() === 'public' ? 'entertainment' : splitDestination[3].toLowerCase();
            let day = splitDestination[4];
            let timeslot = splitDestination[5];
            let outputvideoname = req.query.outputvideoname;
            let userId = req.query.userId;
            let videoId = req.query.videoId;

            let dayValue = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
            const dayINeed = dayValue[day];
            const today = moment().isoWeekday();
            let date;
            if (today < dayINeed) date = moment().isoWeekday(dayINeed).format("YYYY-MM-DD"); //If day is in current week
            else date = moment().add(1, 'weeks').isoWeekday(dayINeed).format("YYYY-MM-DD");
            let airDate = moment(date + ' ' + `${timeslot[0]}${timeslot[1]}:${timeslot[2]}${timeslot[3]}`).format();
            // console.log(airDate)

            let firstAdSlot = [];
            let secondAdSlot = [];
            let check30 = true;
            let check60 = true;

            let firstInternalCheck30 = true;
            let firstInternalCheck60 = true;

            let secondInternalCheck30 = true;
            let secondInternalCheck60 = true;


            let adsObjects1 = await db.CampaignInfo.getCampaignName(state, city, channel, 30, "high", airDate); //35
            let adsObjects2 = await db.CampaignInfo.getCampaignName(state, city, channel, 60, "high", airDate); //35

            let adsObjects3 = await db.CampaignInfo.getInternalCampaignName(state, city, channel, 30, "low", airDate); //10
            let adsObjects4 = await db.CampaignInfo.getInternalCampaignName(state, city, channel, 60, "low", airDate); //10

            let adsObjects5 = await db.CampaignInfo.getInternalCampaignName("0", "0", channel, 30, "low", airDate); //5
            let adsObjects6 = await db.CampaignInfo.getInternalCampaignName("0", "0", channel, 60, "low", airDate); //5

            // console.log(adsObjects1)
            // console.log(adsObjects2)
            // console.log(adsObjects3)
            // console.log(adsObjects4)
            // console.log(adsObjects5)
            // console.log(adsObjects6)

            for (let i = 0; i < 2; i++) {
                // let adBucket = 'ads/';
                let adsObjects;
                // let adSlotNum = 1;
                let adSlotNum = Math.floor(Math.random() * 2);
                if (adSlotNum === 1) {
                    // adBucket = adBucket + '60/'
                    adsObjects = adsObjects2;
                } else {
                    // adBucket = adBucket + '30/'
                    adsObjects = adsObjects1;
                }
                //removing first element (1st element is folder root)
                //picking video randomly from adsObject

                if (adSlotNum === 1 & adsObjects.length > 0) {
                    console.log("0")
                    if (i === 0) {
                        let adNum1 = Math.floor(Math.random() * adsObjects.length);
                        firstAdSlot.push(adsObjects[adNum1]);
                        check60 = false;
                        console.log("1")
                    } else if (i === 1 & (adsObjects.length > 1 || check60)) {

                        let adNum1 = Math.floor(Math.random() * adsObjects.length);
                        while (firstAdSlot.some(item => item.id === adsObjects[adNum1].id)) {
                            adNum1 = Math.floor(Math.random() * adsObjects.length);
                        }
                        secondAdSlot.push(adsObjects[adNum1]);
                        console.log("2")
                    }
                    else if (i === 1 & (adsObjects3.length > 1)) {
                        console.log("3 not")
                        let adNum1 = Math.floor(Math.random() * adsObjects3.length);
                        while (firstAdSlot.some(item => item.id === adsObjects3[adNum1].id)) {
                            adNum1 = Math.floor(Math.random() * adsObjects3.length);
                        }
                        secondAdSlot.push(adsObjects3[adNum1]);

                        let adNum2 = Math.floor(Math.random() * adsObjects3.length);
                        while (
                            firstAdSlot.some(item => item.id === adsObjects3[adNum2].id)
                            || secondAdSlot.some(item => item.id === adsObjects3[adNum2].id)
                        ) {
                            adNum2 = Math.floor(Math.random() * adsObjects3.length);
                        }
                        secondAdSlot.push(adsObjects3[adNum2]);
                    }
                    else if (i === 1 & (adsObjects4.length > 1 || firstInternalCheck60)) {
                        console.log("if no ads find in first internal 30 or external 60 in second slot")

                        let adNum1 = Math.floor(Math.random() * adsObjects4.length);
                        while (firstAdSlot.some(item => item.id === adsObjects4[adNum1].id)) {
                            adNum1 = Math.floor(Math.random() * adsObjects4.length);
                        }
                        secondAdSlot.push(adsObjects4[adNum1]);

                    }
                    else if (i === 1 & (adsObjects6.length > 1 || secondInternalCheck60)) {
                        console.log("second internal ads")

                        let adNum1 = Math.floor(Math.random() * adsObjects6.length);
                        while (firstAdSlot.some(item => item.id === adsObjects6[adNum1].id)) {
                            adNum1 = Math.floor(Math.random() * adsObjects6.length);
                        }
                        secondAdSlot.push(adsObjects6[adNum1]);
                    }
                    else if (i === 1 & (adsObjects5.length > 1)) {
                        let adNum1 = Math.floor(Math.random() * adsObjects5.length);
                        while (firstAdSlot.some(item => item.id === adsObjects5[adNum1].id)) {
                            adNum1 = Math.floor(Math.random() * adsObjects5.length);
                        }
                        secondAdSlot.push(adsObjects5[adNum1]);

                        let adNum2 = Math.floor(Math.random() * adsObjects5.length);
                        while (
                            firstAdSlot.some(item => item.id === adsObjects5[adNum2].id)
                            || secondAdSlot.some(item => item.id === adsObjects5[adNum2].id)
                        ) {
                            adNum2 = Math.floor(Math.random() * adsObjects5.length);
                        }
                        secondAdSlot.push(adsObjects5[adNum2]);
                    }
                    else {
                        secondAdSlot.push({ id: 0, videoUrl: 'https://s3.wasabisys.com/temporary-ads-run/ads/60/5210042650H.mpg' });

                    }

                }
                else {
                    console.log("4")
                    if (i === 0 & adsObjects1.length >= 2) {
                        let adNum1 = Math.floor(Math.random() * adsObjects1.length);
                        firstAdSlot.push(adsObjects1[adNum1]);
                        let adNum2 = Math.floor(Math.random() * adsObjects1.length);
                        while (adNum2 === adNum1) {
                            adNum2 = Math.floor(Math.random() * adsObjects1.length);
                        }
                        firstAdSlot.push(adsObjects1[adNum2]);
                        check30 = false;
                        console.log("5 => 30")

                    } else if (i === 1 & (adsObjects1.length > 3 || check30) & adsObjects1.length >= 2) {

                        let adNum1 = Math.floor(Math.random() * adsObjects1.length);

                        while (firstAdSlot.some(item => item.id === adsObjects1[adNum1].id)) {
                            adNum1 = Math.floor(Math.random() * adsObjects1.length);
                        }
                        secondAdSlot.push(adsObjects1[adNum1]);
                        let adNum2 = Math.floor(Math.random() * adsObjects1.length);
                        while (
                            firstAdSlot.some(item => item.id === adsObjects1[adNum2].id)
                            || secondAdSlot.some(item => item.id === adsObjects1[adNum2].id)
                        ) {
                            adNum2 = Math.floor(Math.random() * adsObjects1.length);
                        }
                        console.log("temp3")
                        secondAdSlot.push(adsObjects1[adNum2]);
                        console.log("6 => 30")
                    }
                    else if (i === 0) {
                        console.log("7")

                        if (adsObjects2.length > 0) {
                            let adNum1 = Math.floor(Math.random() * adsObjects2.length);
                            firstAdSlot.push(adsObjects2[adNum1]);
                            check60 = false;
                            console.log("8")
                        }
                        else if (adsObjects3.length > 1) {
                            console.log("if can't find any first internal or external 1 min ads")
                            let adNum1 = Math.floor(Math.random() * adsObjects3.length);
                            firstAdSlot.push(adsObjects3[adNum1]);
                            let adNum2 = Math.floor(Math.random() * adsObjects3.length);
                            while (adNum2 === adNum1) {
                                adNum2 = Math.floor(Math.random() * adsObjects3.length);
                            }
                            firstAdSlot.push(adsObjects3[adNum2]);
                            firstInternalCheck30 = false;

                        }
                        else if (adsObjects4.length > 0) {
                            console.log("9 not")
                            let adNum1 = Math.floor(Math.random() * adsObjects4.length);
                            firstAdSlot.push(adsObjects4[adNum1]);
                            firstInternalCheck60 = false;

                        }
                        else if (adsObjects5.length > 1) {
                            console.log("if first internal 30 sec not found ")
                            let adNum1 = Math.floor(Math.random() * adsObjects5.length);
                            firstAdSlot.push(adsObjects5[adNum1]);
                            let adNum2 = Math.floor(Math.random() * adsObjects5.length);
                            while (adNum2 === adNum1) {
                                adNum2 = Math.floor(Math.random() * adsObjects5.length);
                            }
                            firstAdSlot.push(adsObjects5[adNum2]);
                            secondInternalCheck30 = false;
                        }
                        else if (adsObjects6.length > 0) {
                            let adNum1 = Math.floor(Math.random() * adsObjects6.length);
                            firstAdSlot.push(adsObjects6[adNum1]);
                            secondInternalCheck60 = false;
                        }
                        else {
                            console.log("if nothing find, here static ads")
                            firstAdSlot.push({ id: 0, videoUrl: 'https://s3.wasabisys.com/temporary-ads-run/ads/60/5310648197H.mpg' });
                        }
                    }
                    else if (i === 1) {
                        console.log("10")
                        if ((adsObjects2.length > 1 || check60) & adsObjects2.length > 0) {

                            let adNum1 = Math.floor(Math.random() * adsObjects2.length);
                            while (firstAdSlot.some(item => item.id === adsObjects2[adNum1].id)) {
                                adNum1 = Math.floor(Math.random() * adsObjects2.length);
                            }
                            secondAdSlot.push(adsObjects2[adNum1]);
                            console.log("11")
                        }
                        else if ((adsObjects3.length > 3 || firstInternalCheck30) & adsObjects3.length >= 2) {
                            console.log("if no ads find in external 30 or external 60")

                            let adNum1 = Math.floor(Math.random() * adsObjects3.length);
                            while (firstAdSlot.some(item => item.id === adsObjects3[adNum1].id)) {
                                adNum1 = Math.floor(Math.random() * adsObjects3.length);
                            }
                            secondAdSlot.push(adsObjects3[adNum1]);
                            let adNum2 = Math.floor(Math.random() * adsObjects3.length);
                            while (
                                firstAdSlot.some(item => item.id === adsObjects3[adNum2].id)
                                || secondAdSlot.some(item => item.id === adsObjects3[adNum2].id)
                            ) {
                                adNum2 = Math.floor(Math.random() * adsObjects3.length);
                            }
                            secondAdSlot.push(adsObjects3[adNum2]);
                        }
                        else if ((adsObjects4.length > 1 || firstInternalCheck60) & adsObjects4.length > 0) {
                            console.log("if no ads find in external 30 or 60 and first internal 30")

                            let adNum1 = Math.floor(Math.random() * adsObjects4.length);
                            while (firstAdSlot.some(item => item.id === adsObjects4[adNum1].id)) {
                                adNum1 = Math.floor(Math.random() * adsObjects4.length);
                            }
                            secondAdSlot.push(adsObjects4[adNum1]);
                        }
                        else if ((adsObjects5.length > 3 || secondInternalCheck30) & adsObjects5.length >= 2) {
                            console.log("no ads in first internal 60 sec")
                            let adNum1 = Math.floor(Math.random() * adsObjects5.length);
                            while (firstAdSlot.some(item => item.id === adsObjects5[adNum1].id)) {
                                adNum1 = Math.floor(Math.random() * adsObjects5.length);
                            }

                            secondAdSlot.push(adsObjects5[adNum1]);
                            let adNum2 = Math.floor(Math.random() * adsObjects5.length);
                            while (
                                firstAdSlot.some(item => item.id === adsObjects5[adNum2].id)
                                || secondAdSlot.some(item => item.id === adsObjects5[adNum2].id)
                            ) {
                                adNum2 = Math.floor(Math.random() * adsObjects5.length);
                            }
                            secondAdSlot.push(adsObjects5[adNum2]);
                        }
                        else if ((adsObjects6.length > 1 || secondInternalCheck60) & adsObjects6.length > 0) {
                            console.log("no ads in second internal 30 sec slot 2")

                            let adNum1 = Math.floor(Math.random() * adsObjects6.length);
                            while (firstAdSlot.some(item => item.id === adsObjects6[adNum1].id)) {
                                adNum1 = Math.floor(Math.random() * adsObjects6.length);
                            }
                            secondAdSlot.push(adsObjects6[adNum1]);
                        }
                        else {
                            //temporary ad 
                            secondAdSlot.push({ id: 0, videoUrl: 'https://s3.wasabisys.com/temporary-ads-run/ads/60/5210042650H.mpg' });
                            console.log("static ads slot 2")
                        }
                    }
                    else {
                        console.log("not have to")
                    }
                }
            }

            console.log(firstAdSlot)
            console.log(secondAdSlot)

            //removing ad reporst if exists (if user uploads another video before its airDate)
            await db.AdsReporting.removeAdReport(userId, airDate);

            for (let i = 0; i < firstAdSlot.length; i++) {
                let adSlot = "First Slot";
                let viewers = 0;
                let campaignID = firstAdSlot[i].id;

                const stitchInfo = await db.StitchAdsInfo.saveStitchInfo({
                    userId, videoId,
                    campaignID, airDate,
                    state, city,
                    channel
                });
                const reportingInfo = await db.AdsReporting.saveAdsReport({
                    adSlot, viewers,
                    videoId, showName: 'Not available',
                    userId, airDate,
                    campaignID, state,
                    city, channel
                });
            }
            for (let i = 0; i < secondAdSlot.length; i++) {
                let adSlot = "Second Slot";
                let viewers = 0;
                let campaignID = secondAdSlot[i].id;
                const stitchInfo = await db.StitchAdsInfo.saveStitchInfo({
                    userId, videoId,
                    campaignID, airDate,
                    state, city,
                    channel
                });
                const reportingInfo = await db.AdsReporting.saveAdsReport({
                    adSlot, viewers,
                    videoId, showName: 'Not available',
                    userId, airDate,
                    campaignID, state,
                    city, channel
                });
            }

            channel.split(' ').join('')
            let ftp = {
                ftpURL: 'mediastreamingcp.com:2121',
                ftpUsername: `w1s_${state}-${city}-${channel}@162.244.81.156`,
                secret: '654321'
            }

            // sending video for stitching
            let videoNameForFtp = day + '-' + timeslot + '-' + outputvideoname;
            transcode.stitchVideos(req.query.destination, ftp, outputvideoname, firstAdSlot, secondAdSlot, videoNameForFtp);
        }
        if (status.error != 0) {
            throw new Error('Error while transcoding video');
        }
    } catch (error) {
        console.log(error);
        // console.error(error, 'Qencode');
        return res.status(401).json({ message: 'something went wrong' });
    }
}

//ADS upload controller
exports.uploadAdVideo = async (req, res) => {

    let { campaignName, adsUserId } = req.query;

    let isCampaignExists = await db.CampaignInfo.checkName(adsUserId, campaignName);
    if (isCampaignExists) {
        return res.status(400).json({ message: 'Campaign already exists' });
    }

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
                try {
                    const videoName = req.file.key;
                    const videoURL = req.file.location;
                    const data = req.body;
                    let outputVideoName = `${data.campaignName}-${data.duration}-0.mp4`;

                    //Saving campaign info
                    res.json({ message: 'Successful' });

                    let destinations = [];
                    if (data.state && data.cityName) {
                        let channels = JSON.parse(data.channels);
                        channels.forEach(item => {
                            let channelName = item.channelName.split(' ');
                            channelName = channelName[0];
                            channelName = channelName === 'Ent' ? 'Public' : channelName;
                            let destination = `stv-curated-data/${data.state}/${data.cityName}/${channelName}/Ads/${outputVideoName}`;
                            if (item.scheduling === 'automated') {
                                destinations.push({
                                    url: `s3://s3.us-east-1.amazonaws.com/${destination}`,
                                    key: config.aws.accessKeyId,
                                    secret: config.aws.secretAccessKey,
                                    permissions: "public-read"
                                });
                            } else {
                                destinations.push({
                                    url: `s3://s3.wasabisys.com/${destination}`,
                                    key: config.wasabi.accessKeyId,
                                    secret: config.wasabi.secretAccessKey,
                                    permissions: "public-read"
                                });
                            }
                        });

                        destinations.push({
                            url: `s3://s3.wasabisys.com/stv-ads-data/${outputVideoName}`,
                            key: config.wasabi.accessKeyId,
                            secret: config.wasabi.secretAccessKey,
                            permissions: "public-read"
                        });

                    } else {
                        destinations.push({
                            url: `s3://s3.wasabisys.com/stv-ads-data/${outputVideoName}`,
                            key: config.wasabi.accessKeyId,
                            secret: config.wasabi.secretAccessKey,
                            permissions: "public-read"
                        });
                        destinations.push({
                            url: `s3://s3.wasabisys.com/stv-curated-data/Ads/${outputVideoName}`,
                            key: config.wasabi.accessKeyId,
                            secret: config.wasabi.secretAccessKey,
                            permissions: "public-read"
                        });
                    }

                    data.videoUrl = `https://stv-ads-data.s3.us-east-1.wasabisys.com/${outputVideoName}`;
                    let campaign = await db.CampaignInfo.createCampaign(data);

                    transcode.transcodeAdVideo(videoURL, destinations, data.duration, campaign.id);

                    return true;

                } catch (error) {
                    console.log(error);
                    return res.status(401).json({ message: 'something went wrong' });
                }
            }
        }
    });

}

exports.adVideoStatus = async (req, res) => {
    try {
        let campaignId = req.query.campaignId;
        let status = JSON.parse(req.body.status);
        if (status.error != 0) {
            await db.CampaignInfo.pauseCampaign(campaignId);
            slack.error({ message: 'Error', stack: 'controller/videoUpload.js' }, `Error while transcoding Ad Video where Campaign Id = ${campaignId}`)
        }
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(200)
    }
}

//UPLOADING VIDEO TO MEDIA CONVERT
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