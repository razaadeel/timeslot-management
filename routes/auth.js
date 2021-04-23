const router = require('express').Router();

const authController = require('../controllers/auth');

// Create User
router.post('/create-user/:channelId', authController.createUser);

router.get('/',authController.testFunction)

module.exports = router;