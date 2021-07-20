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

exports.error = (err, title,) => {
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
        return true
    } catch (error) {
        console.log(error)
        return true
    }
}

exports.videoUploadMsg = (body) => {
    try {
        slack.setWebhook(config.videoUpload);
        slack.webhook({
            channel: "#time-slot-video-submitted-alert",
            username: "webhookbot",
            text: `*${body.scheduling}*`,
            attachments: [{
                author: 'adeel',
                color: '#38d67a',
                title: 'Following are the details',
                text: `Email: ${body.email} \n Input Name: ${body.inputName} \n Output Name: ${body.outputName} \n Destination: ${body.destination}`,
            }]
        }, function (err, response) {
            // if (err) {
            //     console.log(err);
            // } else {
            //     console.log(response);
            // }
        });
        return true
    } catch (error) {
        console.log(error)
        return true
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
            // if (err) {
            //     console.log(err);
            // } else {
            //     console.log(response);
            // }

        });
        return true
    } catch (error) {
        console.log(error)
        return true
    }
}


exports.channelCreationRequest = (body, allChannels) => {
    try {
        let channelNames = '';

        // let cityName = body.city;
        // cityName = cityName.split(' ').join('').toLowerCase();//removing spaces from city name

        allChannels.forEach(channel => {
            let channelName = channel.channelName;;
            channelName = channelName.split(' ');//removing spaces from channel name
            channelName = channelName[0];
            channelNames = channelNames + '*Name:* ' + channelName + '\n' + '*HLS_URL:* ' + channel.HLS_URL + '\n \n'; //appending "channelName" to "channelNames"
        });

        slack.setWebhook(config.cityActivation);
        slack.webhook({
            channel: "#city-activation-alerts",
            username: "webhookbot",
            text: 'Error while creating following channel',
            attachments: [{
                author: 'adeel',
                color: '#e3a539',
                title: 'New City Activation Request',
                text: `Create the following channels manually: \n` + channelNames,
            }]
        }, function (err, response) {
            // if (err) {
            //     console.log(err);
            // } else {
            //     console.log(response);
            // }
        });
        return true
    } catch (error) {
        console.log(error)
        return true
    }
}

exports.channelCreationSuccess = (body, allChannels) => {
    try {
        let channelNames = '';

        // let cityName = body.city;
        // cityName = cityName.split(' ').join('').toLowerCase();//removing spaces from city name

        allChannels.forEach(channel => {
            let channelName = channel.channelName;
            channelName = channelName.split(' ');//removing spaces from channel name
            channelName = channelName[0];
            channelNames = channelNames + '*Name:* ' + channelName + '\n' + '*HLS_URL:* ' + channel.HLS_URL + '\n \n'; //appending "channelName" to "channelNames"
        });

        slack.setWebhook(config.cityActivation);
        slack.webhook({
            channel: "#city-activation-alerts",
            username: "webhookbot",
            text: 'New Channels Created',
            attachments: [{
                author: 'adeel',
                color: '#38d67a',
                title: 'Success',
                text: `Following channels are created successfully: \n \n` + channelNames,
            }]
        }, function (err, response) {
            // if (err) {
            //     console.log(err);
            // } else {
            //     console.log(response);
            // }
        });
        return true
    } catch (error) {
        console.log(error)
        return true
    }
}