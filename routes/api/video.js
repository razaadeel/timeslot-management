const router = require('express').Router();
const videoUploadController = require('../../controllers/videoUpload');
const multer = require('multer')

// route for content video upload
router.post('/upload', videoUploadController.uploadVideo);

// route for content video upload
router.post('/upload-content-video', videoUploadController.uploadVideoFromBubble);

// route for ad videos upload
router.post('/ad-upload', videoUploadController.uploadAdVideo);

router.post('/upload-mediaconvert', multer().any(), videoUploadController.uploadVideoMediaConvert);

//Qencode callback urls
router.post('/qencode-request', videoUploadController.qencodeRequest);
router.post('/callback/advideo-qencode-status', videoUploadController.adVideoStatus);

module.exports = router;