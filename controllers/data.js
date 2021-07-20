const db = require('../models');
const chargify = require('../services/chargify');

// sending intial data i.e states and days
exports.daysAndStates = async (req, res) => {
    try {
        let days = await db.Day.allDays();
        let states = await db.City.allStates();
        res.json({ days, states })
    } catch (error) {
        console.log(error)
        console.error(error, 'testing error');;
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
        console.log(error)
        console.error(error, 'testing error');;
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
        console.log(error)
        console.error(error, 'Error while getting available timeslots');;
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

exports.getChargifyUser = async (req, res) => {
    try {
        let { customerId } = req.query
        let user = await chargify.getCustomer(customerId);
        res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

exports.activeStates = async (req, res) => {
    try {
        let states = await db.CityChannelStatus.activeStates();
        res.json(states);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

exports.activeCitiesOfState = async (req, res) => {
    try {
        let { stateCode } = req.params;
        let cities = await db.CityChannelStatus.activeCitiesOfState(stateCode);
        res.json(cities);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

exports.channelsStatusOfCity = async (req, res) => {
    try {
        let { status, cityId, type } = req.query;

        if (status === 'active') {
            if (type === 'byCity') {
                let channels = await db.CityChannelStatus.activeChannelsOfCity(cityId); //returns all active channels of city
                res.json(channels);
            } else {
                let channels = await db.CityChannelStatus.allActiveChannels(); // returns distinct active channels
                res.json(channels);
            }
        } else {
            let channels = await db.CityChannelStatus.offlineChannelsOfCity(cityId);
            res.json(channels);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}