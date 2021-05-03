const router = require('express').Router();

//
//  Slot booking form Pages
//
router.get('/community', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Community' });
});
router.get('/faith', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Faith' });
});
router.get('/electedOfficials', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Elected Officials' });
});
router.get('/public', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Public' });
});
router.get('/candidate', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Candidate' });
});
router.get('/business', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Business' });
});
router.get('/entertainment', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Entertainment' });
});
router.get('/news', (req, res) => {
    res.render('pages/SignupPage', { channel: 'News' });
});
router.get('/sports', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Sports' });
});


// Authentication Page for Video Upload
router.get('/video-auth', (req, res) => {
    // console.log(req.params)
    res.render('pages/VideoAuthPage', { error: '' });
});


module.exports = router;