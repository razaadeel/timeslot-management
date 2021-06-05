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
        throw new Error(error);
    }
}

//get customer by subscription id
exports.getCustomerBySubID = async (subscriptionId) => {
    try {
        let res = await axios.get(`https://streaming-television-inc.chargify.com/subscriptions/${subscriptionId}.json`, {
            auth: {
                username: config.chargifyAPIKey,
                password: ''
            }
        });

        return res.data.subscription.customer;

    } catch (error) {
        throw new Error(error);
    }
}

exports.getComponentPrice = async (componentId) => {
    try {
        let res = await axios.get(`https://streaming-television-inc.chargify.com/components/${componentId}/price_points.json`, {
            auth: {
                username: config.chargifyAPIKey,
                password: ''
            }
        });

        return res.data.price_points[0].prices[0].unit_price;

    } catch (error) {
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
        throw new Error(error);
    }
}

exports.getBillingPortalLink = async (customerId) => {
    try {
        let res = await axios.get(`https://streaming-television-inc.chargify.com/portal/customers/${customerId}/management_link.json`, {
            auth: {
                username: config.chargifyAPIKey,
                password: ''
            }
        });

        return res.data.url;
    } catch (error) {
        throw new Error(error);
    }
}