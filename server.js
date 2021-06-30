const express = require('express');
const path = require('path');

require('./utils/slack_logs');

const app = express();

//Database 
const db = require('./models');
// connnect database
// db.sequelize.authenticate()
//     .then(() => console.log('database connected...'))
//     .catch(err => console.log("database error:", err));

// //connect and sync database in realtime
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
app.use('/', require('./routes/pages/index'));


//API Routes
app.use('/api/data', require('./routes/api/data'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/video', require('./routes/api/video'));
app.use('/api/webhook', require('./routes/api/webhooks'));
app.use('/api/internal-channel', require('./routes/api/internalChannel'));

//router for testing purpose
app.use('/test', require('./routes/api/test'));

// sending 404 for unknown routes
app.use('*', function (req, res) {
    res.status(404)
    if (req.headers.accept.indexOf('html'))
        res.render('pages/404', { url: req.protocol + '://' + req.get('host') + req.originalUrl })
    else
        res.send("URL cannot found");
})


let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("server running on", port);
});