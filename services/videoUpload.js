const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js').aws //import in dev 
    : require(__dirname + '/../config/config.js').aws; // imp in production

//initializing s3 bucket
const s3 = new aws.S3({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    Bucket: 'video-for-qencode'
});


// uploading temprory video before transcoding 
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /mp4|webm/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype); if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: videos Only!');
    }
}

const s3Upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'video-for-qencode',
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname))
        }
    }),
    // limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('video');

module.exports = s3Upload;
