const axios = require('axios');

const env = process.env.NODE_ENV || 'development';
const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js')//import in dev 
    : require(__dirname + '/../config/config.js'); // import in prod

exports.getCustomer = async (customerId) => {
    try {
        let res = await axios.get('https://streaming-television-inc.chargify.com/customers/43830776.json', {
            auth: {
                username: config.chargifyAPIKey,
                password: ''
            }
        });

        return res.data.customer;

    } catch (error) {
        console.log(error.message);
        throw new Error(error);
    }
}