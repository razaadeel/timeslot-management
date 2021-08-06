const router = require('express').Router();

const chargify = require('../../services/chargify');

const authController = require('../../controllers/auth');

// Create User
router.post('/create-user/:channelId', authController.createUser);

//Update User status
router.post('/update-user-status', authController.updateUserStatus);

// SignUp user
router.post('/signup', authController.signup);

// video upload auth
router.post('/user-by-email', authController.getUserByEmail);

router.post('/billing-portal', authController.getBillingPortal);

router.get('/chargify', async (req, res) => {
    try {
        let customer = await chargify.getCustomer();
        return res.json(customer)
    } catch (error) {
        console.log(error)
        console.error(error, 'testing error');;
        return res.status(400).json({ message: 'Internal server error' });
    }
})

module.exports = router;