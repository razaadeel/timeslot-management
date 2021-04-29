const router = require('express').Router();
const videoUploadController = require('../../controllers/videoUpload');

router.post('/upload', videoUploadController.uploadVideo);

module.exports = router;