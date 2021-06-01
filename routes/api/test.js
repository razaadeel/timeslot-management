const router = require('express').Router();

const QencodeApiClient = require('qencode-api');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../../config/configDev.js')//import in dev 
    : require(__dirname + '/../../config/config.js'); // import in prod

const qencode = new QencodeApiClient(config.qencodeApiKey);

router.get('/', async (req, res) => {
    try {
        let transcodingParams = {
            format: [
                {
                    output: "mp4",
                    // video_codec: "libx264",
                    // height: "720",
                    // audio_bitrate: 128,
                    destination: {
                        url: `s3://s3.us-east-1.amazonaws.com/video-for-qencode/stitch-1.mp4`,
                        key: config.aws.accessKeyId,
                        secret: config.aws.secretAccessKey,
                        permissions: "public-read"
                    },
                    // optimize_bitrate: 0,
                    // bitrate: "1000",
                    // width: "1280",
                    // max_bitrate: "1000",
                    // tag: "timeslotvideo",
                    // framerate: "24",
                    // keyframe: "2",
                    // start_time: "0",
                    // duration: "1680"
                }
            ],
            encoder_version: "1",
            // source: "https://video-for-qencode.s3.amazonaws.com/Architect-1622394680092.mp4"
            stitch: [
                {
                    "url": "https://video-for-qencode.s3.amazonaws.com/ads-1.mp4",
                    "start_time": "0",
                    "duration": "420",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2",
                },
                {
                    "url": "https://video-for-qencode.s3.amazonaws.com/ads-2.mp4",
                    "start_time": "0",
                    "duration": "30",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2",
                },
                {
                    "url": "https://video-for-qencode.s3.amazonaws.com/ads-1.mp4",
                    "start_time": "420",
                    "duration": "420",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2",
                },
                {
                    "url": "https://video-for-qencode.s3.amazonaws.com/ads-2.mp4",
                    "start_time": "0",
                    "duration": "30",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2",
                },
                {
                    "url": "https://video-for-qencode.s3.amazonaws.com/ads-1.mp4",
                    "start_time": "840",
                    "duration": "420",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2",
                },
                {
                    "url": "https://video-for-qencode.s3.amazonaws.com/ads-2.mp4",
                    "start_time": "0",
                    "duration": "30",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2",
                },
                {
                    "url": "https://video-for-qencode.s3.amazonaws.com/ads-1.mp4",
                    "start_time": "1260",
                    "duration": "420",
                    "bitrate": "1000",
                    "framerate": "24",
                    "keyframe": "2",
                },
            ]
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
                }
            }
            else {
                break;
            }
        }
        res.json('asd');
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        // await s3.fileUpload();
        // let subscription = await chargify.getCustomerSubscription(44322954);
        console.log('POST');
        let data = req.body;
        console.log(data);
        res.json({ message: 'success' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;