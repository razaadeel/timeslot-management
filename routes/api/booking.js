const router = require('express').Router();

const bookingController = require('../../controllers/booking');

router.get('/check-booking/:email', bookingController.checkBooking);

module.exports = router;