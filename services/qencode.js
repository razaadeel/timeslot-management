const QencodeApiClient = require('qencode-api');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js')[env] //import in dev 
    : require(__dirname + '/../config/config.js')[env]; // import in prod

const qencode = new QencodeApiClient(config.qencodeApiKey);

module.exports = transocde = (videoUrl, destination) => {
    try {
        let transcodingParams = {
            format: [
                {
                    output: "mp4",
                    video_codec: "libx264",
                    height: "720",
                    audio_bitrate: 128,
                    destination: {
                        url: `s3://s3.us-east-1.amazonaws.com/${destination}/video.mp4`,
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
        task.StartCustom(transcodingParams);
        console.log("Status URL: ", task.statusUrl);

    } catch (error) {
        console.log(error);
    }
}