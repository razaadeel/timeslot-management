const router = require('express').Router();
// const s3 = require('../../services/aws-s3');
const db = require('../../models/index');

router.get('/', async (req, res) => {
    try {

        res.json({ message: 'success' });
    } catch (error) {
        console.log(error)
        // console.error(error, 'testing error');
        res.status(400).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        let status = JSON.parse(req.body.status);
        if (status.error == 0) {
            console.log(req.body)
            console.log(req.query)
            res.json({ message: 'success' });
        } else {
            throw new Error('Video transcoding fail');
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;