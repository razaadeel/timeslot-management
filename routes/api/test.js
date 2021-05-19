const router = require('express').Router();
const s3 = require('../../services/aws-s3');
const { route } = require('../pages');


router.get('/', async (req, res) => {
    try {
        await s3.fileUpload();
        res.json({ message: 'Successful' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message })
    }
});

module.exports = router;