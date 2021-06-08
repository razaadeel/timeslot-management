const router = require('express').Router();

const QencodeApiClient = require('qencode-api');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../../config/configDev.js')//import in dev 
    : require(__dirname + '/../../config/config.js'); // import in prod

const qencode = new QencodeApiClient(config.qencodeApiKey);

router.get('/', async (req, res) => {
    try {
        res.json({ message: 'success' });
    } catch (error) {
        console.log(error)
        console.error(error, 'testing error');;
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