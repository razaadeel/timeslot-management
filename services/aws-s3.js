const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js') //import in dev 
    : require(__dirname + '/../config/config.js'); // imp in production

// //initializing s3 bucket
// const s3 = new aws.S3({
//     accessKeyId: config.aws.accessKeyId,
//     secretAccessKey: config.aws.secretAccessKey,
//     region: 'us-east-1'
// });

// initialzing wasabi s3 bucket
const wasabiEndpoint = new aws.Endpoint('s3.us-east-1.wasabisys.com');
const s3 = new aws.S3({
    endpoint: wasabiEndpoint,
    accessKeyId: config.wasabi.accessKeyId,
    secretAccessKey: config.wasabi.secretAccessKey
});

const AwsS3 = new aws.S3({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
});


// file type handler
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
    let params = {
        Key: 'crawl.text',
        Body: showName,
        Bucket: bucket
    };

    AwsS3.upload(params, (err, data) => {
        if (err) {
            throw new Error(err);
        }
        console.log(data)
        return true
    });
}

exports.mediaConvertUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'stv-raw-data',
        acl: 'bucket-owner-full-control',
        key: function (req, file, cb) {
            cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname))
        },
        metadata: function (req, file, cb) {
            cb(null, { destination: req.destination });
        },
    }),
    // limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('video');


exports.getBucketObjects = async (bucketPath) => {
    let params = {
        Bucket: 'temporary-ads-run',
        Delimiter: '/',
        Prefix: bucketPath
    }

    return new Promise(function (resolve, reject) {
        s3.listObjects(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Contents);
            }
        });
    });
}


//ADS VIDEO UPLOAD
exports.videoAdUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'temporary-ads-run/temp',
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