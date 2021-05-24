const router = require('express').Router();

const chargify = require('../../services/chargify');

router.get('/', async (req, res) => {
    try {
        let subscription = await chargify.getCustomerSubscription(44322954);
        res.json(subscription);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        // await s3.fileUpload();
        // let subscription = await chargify.getCustomerSubscription(44322954);
        console.log(req.body)
        res.json({ message: 'success' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;