const Slack = require('slack-node');


const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js').slack_webhook //import in dev 
    : require(__dirname + '/../config/config.js').slack_webhook;

const slack = new Slack();
slack.setWebhook(config);

console.error = (err, title,) => {
    try {
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