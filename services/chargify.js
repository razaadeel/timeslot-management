const axios = require('axios');

const env = process.env.NODE_ENV || 'development';
const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js')//import in dev 
    : require(__dirname + '/../config/config.js'); // import in prod

exports.getCustomer = async (customerId) => {
    try {
        let res = await axios.get(`https://streaming-television-inc.chargify.com/customers/${customerId}.json`, {
            auth: {
                username: config.chargifyAPIKey,
                password: ''
            }
        });

        return res.data.customer;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

exports.getCustomerSubscription = async (customerId) => {
    try {
        let res = await axios.get(`https://streaming-television-inc.chargify.com/customers/${customerId}/subscriptions.json`, {
            auth: {
                username: config.chargifyAPIKey,
                password: ''
            }
        });

        return res.data[0].subscription.product;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// metatdata = additional fields on chargify forms
exports.getCustomerMetadata = async (customerId) => {
    try {
        let res = await axios.get(`https://streaming-television-inc.chargify.com/customers/${customerId}/metadata.json`, {
            auth: {
                username: config.chargifyAPIKey,
                password: ''
            }
        });

        //returns array of metadata fields with values
        return res.data.metadata;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}