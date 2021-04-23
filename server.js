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
    res.render('pages/SignupPage');
});
app.get('/faith', (req, res) => {
    res.render('pages/SignupPage');
});
app.get('/electedOfficials', (req, res) => {
    res.render('pages/SignupPage');
});
app.get('/public', (req, res) => {
    res.render('pages/SignupPage');
});
app.get('/candidate', (req, res) => {
    res.render('pages/SignupPage');
});
app.get('/business', (req, res) => {
    res.render('pages/SignupPage');
});
app.get('/entertainment', (req, res) => {
    res.render('pages/SignupPage');
});
app.get('/news', (req, res) => {
    res.render('pages/SignupPage');
});
app.get('/sports', (req, res) => {
    res.render('pages/SignupPage');
});


//API Routes
app.use('/api/data', require('./routes/data'));
app.use('/api/auth', require('./routes/auth'));

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("server running on", port);
});