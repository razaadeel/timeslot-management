const router = require('express').Router();

const dataController = require('../../controllers/data');

const db = require('../../models/index');

//get days and states
router.get('/initial-data', dataController.daysAndStates);

// //GET cities by state code
router.get('/cities/:stateCode', dataController.citiesOfState);

// //GET timeslots by city, day, channel 
router.get('/timeslots', dataController.getAvailableTimeslots);

//get details of chargify user
router.get('/chargify-user', dataController.getChargifyUser);

//Get states where channels are active
router.get('/active-states', dataController.activeStates);

//Get active city of 
router.get('/active-cities/:stateCode', dataController.activeCitiesOfState);

//Get states where channels are active
router.get('/active-channels/:cityId', dataController.activeChannelsOfCity);

//Get states where channels are active
router.get('/oflline-channels/:cityId', dataController.offlineChannelsOfCity);

module.exports = router;