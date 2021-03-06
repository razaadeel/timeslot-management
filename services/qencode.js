const QencodeApiClient = require('qencode-api');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js')//import in dev 
    : require(__dirname + '/../config/config.js'); // import in prod


//automated system ( content video will upload directly to aws s3 after transcoding)
exports.automatedSystem = async (videoUrl, destination, outputVideoName) => {
    try {
        const qencode = new QencodeApiClient(config.qencodeApiKey);

        let transcodingParams = {
            format: [
                {
                    output: "mp4",
                    video_codec: "libx264",
                    height: "720",
                    audio_bitrate: 128,
                    destination: {
                        url: `s3://s3.us-east-1.amazonaws.com/${destination}/${outputVideoName}`,
                        key: config.aws.accessKeyId,
                        secret: config.aws.secretAccessKey,
                        permissions: "public-read"
                    },
                    optimize_bitrate: 0,
                    bitrate: "1000",
                    width: "1280",
                    max_bitrate: "1000",
                    // tag: "timeslotvideo",
                    framerate: "24",
                    keyframe: "2",
                    start_time: "0",
                    duration: "1680"
                }
            ],
            encoder_version: "2",
            source: videoUrl
        }

        let task = qencode.CreateTask();
        let i = 0;
        while (true) {
            if (i < 2) {
                let transcode = await task.StartCustom(transcodingParams);
                i++;
                if (transcode.error == 0) {
                    console.log('video sent for transcoding');
                    break;
                }
            }
            else {
                break;
            }
        }
    } catch (error) {
        console.log(error)
        console.error(error, 'Error while sending video to qencode');;
    }
}

//manual system STEP:1 (video will sent for stitching with ads)
exports.manualSystem = async (videoUrl, destination, outputVideoName, userId, videoId) => {
    try {
        const qencode = new QencodeApiClient(config.qencodeApiKey);
        let transcodingParams = {
            format: [
                {
                    "output": "mp4",
                    "start_time": 0,
                    "duration": 420, //7 min
                    "destination": {
                        url: `s3://s3.us-east-2.wasabisys.com/${destination}/1${outputVideoName}`,
                        key: config.wasabi.accessKeyId,
                        secret: config.wasabi.secretAccessKey,
                        permissions: "public-read"
                    },
                    "audio_bitrate": "128",
                    "optimize_bitrate": "0",
                    "max_bitrate": "1000",

                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2s"
                },
                {
                    "output": "mp4",
                    "start_time": 420,
                    "duration": 420, //14 min + 1 min ads = 15 mins   840
                    "destination": {
                        url: `s3://s3.us-east-2.wasabisys.com/${destination}/2${outputVideoName}`,
                        key: config.wasabi.accessKeyId,
                        secret: config.wasabi.secretAccessKey,
                        permissions: "public-read"
                    },
                    "audio_bitrate": "128",
                    "optimize_bitrate": "0",
                    "max_bitrate": "1000",

                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2s"
                }, {
                    "output": "mp4",
                    "start_time": 840,  //14 mins      / 14 mins  840
                    "duration": 840,
                    "destination": {
                        url: `s3://s3.us-east-2.wasabisys.com/${destination}/3${outputVideoName}`,
                        key: config.wasabi.accessKeyId,
                        secret: config.wasabi.secretAccessKey,
                        permissions: "public-read"
                    },
                    "audio_bitrate": "128",
                    "optimize_bitrate": "0",
                    "max_bitrate": "1000",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2s"
                }
            ],
            encoder_version: "2",
            // callback_url: `http://tms-dev01.services.citystvnetwork.com/api/video/qencode-request?destination=${destination}&outputvideoname=${outputVideoName}&userId=${userId}&videoId=${videoId}`,
            callback_url: `https://citystreamingtelevision.com/api/video/qencode-request?destination=${destination}&outputvideoname=${outputVideoName}&userId=${userId}&videoId=${videoId}`,
            source: videoUrl
        }
        // remove space in url

        let task = qencode.CreateTask();
        let i = 0;
        while (true) {
            if (i < 2) {
                let transcode = await task.StartCustom(transcodingParams);
                i++;
                if (transcode.error == 0) {
                    console.log('video sent for spliting');
                    break;
                }
            }
            else {
                break;
            }
        }

    } catch (error) {
        console.log(error);
        console.error(error, 'Error while sending video to qencode');
    }
}

//manual system STEP:1 (stich content video with ad video for manual channels)
exports.stitchVideos = async (destination, ftp, outputVideoName, firstAdSlot, secondAdSlot, videoNameForFtp) => {
    try {
        const qencode = new QencodeApiClient(config.qencodeApiKey);

        let stitchArr = [];
        stitchArr.push({ "url": `https://s3.wasabisys.com/${destination}/1${outputVideoName}` });

        if (firstAdSlot.length === 1) {
            stitchArr.push({ "url": firstAdSlot[0].videoUrl });
        } else if (firstAdSlot.length > 1) {
            stitchArr.push({ "url": firstAdSlot[0].videoUrl });
            stitchArr.push({ "url": firstAdSlot[1].videoUrl });
        }

        stitchArr.push({ "url": `https://s3.wasabisys.com/${destination}/2${outputVideoName}` });

        if (secondAdSlot.length === 1) {
            stitchArr.push({ "url": secondAdSlot[0].videoUrl });
        } else if (secondAdSlot.length > 1) {

            stitchArr.push({ "url": secondAdSlot[0].videoUrl });
            stitchArr.push({ "url": secondAdSlot[1].videoUrl });
        }

        stitchArr.push({ "url": `https://s3.wasabisys.com/${destination}/3${outputVideoName}` });

        let transcodingParams = {
            "format": [
                {
                    "output": "mp4",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2s",
                    "height": "720",
                    "width": "1280",
                    "destination": [
                        {
                            url: `s3://s3.us-east-2.wasabisys.com/${destination}/finalOutput-${outputVideoName}`,
                            key: config.wasabi.accessKeyId,
                            secret: config.wasabi.secretAccessKey,
                            permissions: "public-read"
                        },
                        // {
                        //     "url": `ftp://mediastreamingcp.com:2121/${outputVideoName}`,
                        //     "key": "w1s_adeel-test-channel@162.244.81.156",
                        //     "secret": "12345678"
                        // }
                        {
                            "url": 'ftp://' + ftp.ftpURL + '/' + videoNameForFtp,
                            "key": ftp.ftpUsername,
                            "secret": ftp.secret
                        }
                    ]
                }
            ],
            encoder_version: "1",
            stitch: stitchArr,
        }

        let task = qencode.CreateTask();
        let transcode = await task.StartCustom(transcodingParams);
        if (transcode.error == 0) {
            console.log('video sent for stitching');
        } else {
            console.log('Error while sending video for transcoding');
        }
        // let i = 0;
        // while (true) {
        //     if (i < 2) {
        //         let transcode = await task.StartCustom(transcodingParams);
        //         i++;
        //         if (transcode.error == 0) {
        //             console.log('video sent for stitching');
        //             break;
        //         }
        //     }
        //     else {
        //         break;
        //     }
        // }
    } catch (error) {
        console.log(error);
        console.error(error, 'Error while sending video to qencode');
    }
}

// transcoding ad video 
exports.transcodeAdVideo = async (videoUrl, destinations, duration, campaignId) => {
    try {
        const qencode = new QencodeApiClient(config.qencodeApiKey);
        let transcodingParams = {
            "format": [
                {
                    "output": "mp4",
                    "start_time": 0,
                    "duration": duration,
                    "destination": destinations,
                    "audio_bitrate": "128",
                    "optimize_bitrate": "0",
                    "max_bitrate": "1000",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2s"
                }
            ],
            encoder_version: "2",
            // callback_url: `http://tms-dev01.services.citystvnetwork.com/api/video/callback/advideo-qencode-status?campaignId=${campaignId}`,
            callback_url: `https://citystreamingtelevision.com/api/video/callback/advideo-qencode-status?campaignId=${campaignId}`,
            source: videoUrl,
        }

        let task = qencode.CreateTask();
        let i = 0;
        while (true) {
            if (i < 2) {
                let transcode = await task.StartCustom(transcodingParams);
                i++;
                if (transcode.error == 0) {
                    console.log('video upload successfull')
                    break;
                } else {
                    console.log(transcode)
                }
            }
            else {
                break;
            }
        }
    } catch (error) {
        console.log(error);
        console.error(error, 'Error in services/qencode');
    }
}