const db = require('../models');

exports.checkBooking = async (req, res) => {
    try {
        let { email } = req.params;
        let booking = await db.BookedSlot.checkBooking(email);
        if (booking) {
            res.json({ bookingExist: true });
        } else {
            res.json({ bookingExist: false });
        }
    } catch (error) {
        console.log(error);
    }
}