const router = require('express').Router();
const videoUploadController = require('../../controllers/videoUpload');
const multer = require('multer')

// route for content video upload
router.post('/upload', videoUploadController.uploadVideo);

// route for ad videos upload
router.post('/ad-upload', videoUploadController.uploadAdVideo);

router.post('/upload-mediaconvert', multer().any(), videoUploadController.uploadVideoMediaConvert);

router.post('/qencode-request', videoUploadController.qencodeRequest);

module.exports = router;