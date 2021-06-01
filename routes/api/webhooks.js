const router = require('express').Router();

const webhooks = require('../../controllers/webhooks');

//subscription componenet update
router.post('/sub-comp-update', webhooks.subscriptionComponentUpdate);

module.exports = router;