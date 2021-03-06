const db = require('../models');
const chargify = require('../services/chargify');
const moment = require('moment');

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

        //below conditions are for making timeslots in 12hrs format
        let slots = timeslots.map(item => {
            let startTime = `${item.startTime}`.split(':');
            let endTime = `${item.endTime}`.split(':');

            if (Number(startTime[0]) >= 12) {
                if (startTime[0] != 12) startTime[0] = startTime[0] - 12
                startTime = `${startTime[0]}:${startTime[1]}pm`
            } else {
                startTime = `${startTime[0]}:${startTime[1]}am`
            }

            if (Number(endTime[0]) > 11) {
                if (endTime[0] != 12) endTime[0] = endTime[0] - 12

                endTime = `${endTime[0]}:${endTime[1]}pm`

            } else {
                if (endTime[0] == '00') endTime[0] = '12'
                endTime = `${endTime[0]}:${endTime[1]}am`
            }
            return { id: item.id, startTime, endTime }
        });

        return res.json(slots);
    } catch (error) {
        console.log(error)
        console.error(error, 'Error while getting available timeslots');;
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

exports.getAvailableTimeslotsByCity = async (req, res) => {
    try {
        let { day, city, channel } = req.query;
        let days = await db.Day.allDays();

        let data = [];
        days.map(async item => {
            // getAvailableSlots func created in Timeslot model
            const timeslots = await db.Timeslot.getAvailableSlots(item.id, city, channel);
            data.push({
                day: item.day,
                dayId: item.id,
                availableSlots: timeslots.length
            });

            if (data.length === days.length) {
                res.json(data);
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

// for getting user next schedule video
exports.getScheduledVideo = async (req, res) => {
    try {
        let { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        let video = await db.ContentVideoUpload.getUserScheduleVideo(userId);
        let airDate;
        if (video) {
            airDate = await moment(video.airDate).format('MMMM Do, YYYY');
        }

        //formating time in 12hrs date
        // airDate = airDate.split(' ');
        // let time = airDate[1].split(':')
        // if (time[0] > 12) {
        //     time = `${time[0] - 12}:${time[1]}pm`
        //     console.log('1', time)
        // } else if (time[0] === 12) {
        //     time = `${time[0]}:${time[1]}pm`
        //     console.log('2', time)
        // } else {
        //     time = `${time[0]}:${time[1]}am`
        // }

        // airDate = airDate[0] + ' ' + time

        return res.json({ video, airDate });

    } catch (error) {
        console.log(error);
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