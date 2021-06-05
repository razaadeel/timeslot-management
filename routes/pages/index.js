const router = require('express').Router();

//
//  Slot booking form Pages
//
router.get('/community', (req, res) => {
    res.render('pages/SlotBookingForm', { channel: 'Community', });
});
router.get('/faith', (req, res) => {
    res.render('pages/SlotBookingForm', { channel: 'Faith' });
});
router.get('/electedOfficials', (req, res) => {
    res.render('pages/SlotBookingForm', { channel: 'ElectedOfficials' });
});
router.get('/candidate', (req, res) => {
    res.render('pages/SlotBookingForm', { channel: 'Candidate' });
});
router.get('/business', (req, res) => {
    res.render('pages/SlotBookingForm', { channel: 'Business' });
});
router.get('/entertainment', (req, res) => {
    res.render('pages/SlotBookingForm', { channel: 'Entertainment' });
});
router.get('/news', (req, res) => {
    res.render('pages/SlotBookingForm', { channel: 'News' });
});
router.get('/sports', (req, res) => {
    res.render('pages/SlotBookingForm', { channel: 'Sports' });
});

//Timeslot Booking Form
router.get('/form', (req, res) => {
    res.render('pages/SlotBookingForm', { channel: 'Sports' });
});


// Authentication Page for Video Upload
router.get('/video-auth', (req, res) => {
    // console.log(req.params)
    res.render('pages/VideoAuthPage', { error: '' });
});

router.get('/auth-billing-portal', (req, res) => {
    res.render('pages/BillingAuthPage', { error: '' });
});


module.exports = router;