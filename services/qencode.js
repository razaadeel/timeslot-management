const QencodeApiClient = require('qencode-api');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js')//import in dev 
    : require(__dirname + '/../config/config.js'); // import in prod

const qencode = new QencodeApiClient(config.qencodeApiKey);

module.exports = transcode = async (videoUrl, destination, outputVideoName) => {
    try {
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
                    console.log('video upload successfull')
                    break;
                }
            }
            else {
                break;
            }
        }
    } catch (error) {
        console.log(error)
console.error(error, 'testing error');;
    }
}