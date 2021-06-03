const chargify = require('../services/chargify');
const leaddyno = require('../services/leaddyno');

// when somone chagnes subscription component, this func will send data to leaddyno
exports.subscriptionComponentUpdate = async (req, res) => {
    try {
        res.json({ message: 'success' });

        let data = req.body;
        let newAllocation = data.payload.new_allocation; // '0' for OFF and '1' for ON

        if (newAllocation === '1') {
            let subscriptionId = data.payload.subscription.id;
            let componentId = data.payload.component.id;
            let customer = await chargify.getCustomerBySubID(subscriptionId);
            let price = await chargify.getComponentPrice(componentId);

            //creating purchase in leaddyno
            leaddyno.createPurchase(customer.email, price);
        }
        return true;

    } catch (error) {
        console.log(error);
        console.error(error, 'Error in subscription update / LeadDyno webhook');;
        res.status(400).json({ message: error.message });
    }
};