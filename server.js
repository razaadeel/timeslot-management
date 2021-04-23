const express = require('express');
const path = require('path');

const app = express();

//chargebee
// require('./config/chargebee');

//Database 
const db = require('./models');
// db.authenticate()
//     .then(() => console.log('database connected...'))
//     .catch(err => console.log("database error:", err));
db.sequelize.sync()
    .then(() => console.log('database connected...'))
    .catch(err => console.log("database error:", err));

//Set view engine to ejs
app.set('view engine', 'ejs');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//View Routes
app.get('/community', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Community' });
});
app.get('/faith', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Faith' });
});
app.get('/electedOfficials', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Elected Officials' });
});
app.get('/public', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Public' });
});
app.get('/candidate', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Candidate' });
});
app.get('/business', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Business' });
});
app.get('/entertainment', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Entertainment' });
});
app.get('/news', (req, res) => {
    res.render('pages/SignupPage', { channel: 'News' });
});
app.get('/sports', (req, res) => {
    res.render('pages/SignupPage', { channel: 'Sports' });
});


//API Routes
app.use('/api/data', require('./routes/data'));
app.use('/api/auth', require('./routes/auth'));

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("server running on", port);
});