const router = require('express').Router();
const videoUploadController = require('../../controllers/videoUpload');

router.post('/upload', videoUploadController.uploadVideo);

router.post('/upload-mediaconvert', videoUploadController.uploadVideoMediaConvert);

router.post('/qencode-request', videoUploadController.qencodeRequest);

module.exports = router;