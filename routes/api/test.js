const router = require('express').Router();
// const s3 = require('../../services/aws-s3');
// const db = require('../../models/index');
// const moment = require('moment');

const videoUploadController = require('../../controllers/videoUpload');

router.get('/', async (req, res) => {
    try {

        res.json({ message: 'success' });
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        // console.log(req.body.error)
        if (req.body.error) {
            throw new Error('Testing slack error log');
        } else {
            res.json({ message: 'success' });
        }
    } catch (error) {
        console.error(error, 'testing error');
        res.status(400).json({ message: error.message });
    }
});


router.post('/qencode-test', videoUploadController.qencodeRequest);

module.exports = router;