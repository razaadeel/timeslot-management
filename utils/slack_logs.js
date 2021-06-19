const Slack = require('slack-node');


const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js').slack //import in dev 
    : require(__dirname + '/../config/config.js').slack;

const slack = new Slack();

console.error = (err, title,) => {
    try {
        slack.setWebhook(config.error);
        slack.webhook({
            channel: "#errors-log",
            username: "webhookbot",
            text: err.message,
            attachments: [{
                author: 'adeel',
                color: 'danger',
                title: title,
                text: err.stack,
            }]
        }, function (err, response) {
            // console.log(response);
        });
    } catch (error) {
        console.log(error)
    }
}

exports.videoUploadMsg = (body) => {
    try {
        slack.setWebhook(config.videoUpload);
        slack.webhook({
            channel: "#time-slot-video-submitted-alert",
            username: "webhookbot",
            text: 'Time Slot Video Submitted Alert',
            attachments: [{
                author: 'adeel',
                color: '#38d67a',
                title: 'Following are the details',
                text: `Email: ${body.email} \n
                       Input Name: ${body.inputName} \n
                       Output Name: ${body.outputName} \n
                       Destination: ${body.destination}
                `,
            }]
        }, function (err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        });
    } catch (error) {
        console.log(error)
    }
}

exports.newUserMsg = (body) => {
    try {
        slack.setWebhook(config.newUser);
        slack.webhook({
            channel: "#time-slot-creation-alert",
            username: "webhookbot",
            text: 'Time Slot Creation Alert',
            attachments: [{
                author: 'adeel',
                color: '#38d67a',
                title: 'Following are the details',
                text: `Email: ${body.email} \n City: ${body.city} \n State: ${body.state} \n timeslot: ${body.timeslot} \n Channel: ${body.channel} \n`,
            }]
        }, function (err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        });
    } catch (error) {
        console.log(error)
    }
}


exports.newChannelCreationMsg = (body) => {
    try {
        let channelNames = '';
        body.channels.forEach(channel => {
            channelNames = channelNames + channel.channelName + '\n'
        });
        slack.setWebhook(config.cityActivation);
        slack.webhook({
            channel: "#city-activation-alerts",
            username: "webhookbot",
            text: 'New City Activation Request',
            attachments: [{
                author: 'adeel',
                color: '#f5aa42',
                title: 'Following are the details',
                text: `Create the following channels for this City: ${body.city}, State: ${body.state} \n` + channelNames,
            }]
        }, function (err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        });
    } catch (error) {
        console.log(error)
    }
}