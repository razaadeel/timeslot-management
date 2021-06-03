const Slack = require('slack-node');

const slack = new Slack();
slack.setWebhook('https://hooks.slack.com/services/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');

console.error = (err, title,) => {
    try {
        slack.webhook({
            channel: "#errors-logs",
            username: "webhookbot",
            text: err.message,
            attachments: [{
                author: 'adeel',
                color: 'danger',
                title: title,
                text: err.stack,
            }]
        }, function (err, response) {
            console.log(response);
        });
    } catch (error) {
        console.log(error)
console.error(error, 'testing error');;
    }
}