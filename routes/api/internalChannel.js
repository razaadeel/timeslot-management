const router = require('express').Router();

const internalChannel = require('../../controllers/internalChannel');

router.post('/create', internalChannel.createChannel);

module.exports = router;