const router = require('express').Router();

const authController = require('../../controllers/auth');

// Create User
router.post('/create-user/:channelId', authController.createUser);

// video upload auth
router.post('/user-by-email', authController.getUserByEmail);

module.exports = router;