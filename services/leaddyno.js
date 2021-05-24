const axios = require('axios');

const env = process.env.NODE_ENV || 'development';
const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js')//import in dev 
    : require(__dirname + '/../config/config.js'); // import in prod

// leadDynoPrivateKey

const api = axios.create({
    baseURL: 'https://api.leaddyno.com/v1',
    headers: {
        key: config.leadDynoPrivateKey
    }
});

//CREATE LEAD AND PURCHASE/CUSTOMER in leaddyno with referal code
exports.createLead = async (email, referalCode) => {
    try {

        //createing lead first
        await api.post('/leads', { email, code: referalCode });

        //converting above lead into customer at leaddyno
        await api.post('/leads', { email, purchase_amount: "50.0" });

        return true;

    } catch (error) {
        console.log(error);
        return true;
    }
}