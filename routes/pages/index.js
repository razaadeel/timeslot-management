const router = require('express').Router();

router.get('/', (req, res) => {
    res.redirect('https://www.streamingtvinc.com/')
});

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


// Authentication Page for Video Upload
router.get('/video-auth', (req, res) => {
    // console.log(req.params)
    res.render('pages/VideoAuthPage', { error: '' });
});


// Route for ad upload
router.get('/ads-upload', (req, res) => {
    // console.log(req.params)
    res.render('pages/AdsVideoUploadPage');
});

router.get('/auth-billing-portal', (req, res) => {
    res.render('pages/BillingAuthPage', { error: '' });
});

module.exports = router;