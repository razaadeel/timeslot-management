const db = require('../models');

// sending intial data i.e states and days
exports.daysAndStates = async (req, res) => {
    try {
        let days = await db.Day.allDays();
        let states = await db.City.allStates();
        res.json({ days, states })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

exports.citiesOfState = async (req, res) => {
    try {
        let { stateCode } = req.params;
        let cities = await db.City.cityByStateCode(stateCode)
        return res.json(cities);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

exports.getAvailableTimeslots = async (req, res) => {
    try {
        let { day, city, channel } = req.query;

        // getAvailableSlots func created in Timeslot model
        const timeslots = await db.Timeslot.getAvailableSlots(day, city, channel);
        return res.json(timeslots);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}