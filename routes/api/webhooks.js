const router = require('express').Router();

const webhooks = require('../../controllers/webhooks');

//subscription componenet update
router.post('/sub-comp-update', webhooks.subscriptionComponentUpdate);


/**
 * @Method POST
 * @Usecase getting data whenever user buys a subscription in stripe
 */
router.post('/stripe/subscription-created', webhooks.stripeSubscriptionCreated);

module.exports = router;