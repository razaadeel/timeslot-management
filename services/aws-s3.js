const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js').aws //import in dev 
    : require(__dirname + '/../config/config.js').aws; // imp in production

//initializing s3 bucket
const s3 = new aws.S3({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    // Bucket: 'video-for-qencode'
});


// uploading temprory video before transcoding 
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /mp4|webm|mov|webm|ogv|flv|m4v/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype); //it is giving false for mov file types
    // console.log(extname, mimetype)
    if (extname) {
        return cb(null, true);
    } else {
        cb('Error: videos Only!');
    }
}

exports.videoUpload = multer({
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


exports.fileUpload = (showName, bucket) => {
    console.log(showName)
    let params = {
        Key: 'crawl.text',
        Body: showName,
        Bucket: bucket
    };

    s3.upload(params, (err, data) => {
        if (err) {
            throw new Error(err);
        }
        console.log(data)
        return true
    });

}