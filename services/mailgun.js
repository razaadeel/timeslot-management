const Mailgun = require('mailgun-js');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js')//import in dev 
    : require(__dirname + '/../config/config.js'); // import in prod

//Your api key, from Mailgun’s Control Panel
const api_key = config.mailgun.apiKey;
//Your domain, from the Mailgun Control Panel
const domain = config.mailgun.domain;
//Your sending email address
const from_who = config.mailgun.adminAlert;


const mailgun = new Mailgun({ apiKey: api_key, domain: domain });

exports.sendEmail = (type, body) => {
    try {
        let subject = '';
        let html = '';
        if (type === 'channelCreationRequest') {
            subject = 'New City Activation Request';
            html = `<div>Create the following channels manually: </div>`;
            body.forEach(channel => {
                html = html + `<div>Name: ${channel.channelName}</div><div>HLS_URL: ${channel.HLS_URL}</div>`
            });
        } else if (type === 'channelCreationSuccess') {
            subject = 'Channels Created Successfully';
            html = `<div>Following channels are created successfully: </div>`;
            body.forEach(channel => {
                html = html + `<div>Name: ${channel.channelName}</div><div>HLS_URL: ${channel.HLS_URL}</div>`
            });
        } else if (type === 'newUser') {
            subject = 'Time Slot Creation Alert';
            html = `<div>A new user is registered, following are the details:
                    <div>User Id: ${body.userId}<b></b></div>
                    <div>Email: <b>${body.email}</b></div>
                    <div>City: <b>${body.city},${body.state}</b></div>
                    <div>Channel: <b>${body.channel}</b></div>
                    <div>Timeslot: <b>${body.timeslot}</b></div>
                    <div>Timeslot: <b>${body.showName}</b></div>
            `;
        } else if (type === 'contentVideoUpload') {
            subject = 'Content Video Upload Alert';
            html = `<b>${body.scheduling}</b>A new video is uploaded by following user
                    <div>Email: <b>${body.email}</b></div>
                    <div>Input Video Name: <b>${body.inputName}</b></div>
                    <div>Output Video Name: <b>${body.outputName}</b></div>
                    <div>Destination / Output Folder: <b>${body.destination}</b></div>
            `;
        }

        const data = {
            //Specify email data
            from: from_who,
            //The email to contact
            to: ['teamouts001@gmail.com', 'teamouts002@gmail.com', 'teamouts003@gmail.com', 'simon@citystvnetwork.com'],
            //Subject and text data  
            subject: subject,
            html: html
        }
        //Invokes the method to send emails given the above data with the helper library
        mailgun.messages().send(data, function (err, body) {
            if (err) {
                throw Error(err);
            }
            else {
                console.log(body);
            }
        });
    } catch (error) {
        console.log(error);
    }
}