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

//Get channels based on their status which will send in query i.e ?status=active/offline
router.get('/channels', dataController.channelsStatusOfCity);

//router.get('/channels/:cityId', dataController.channelsStatusOfCity);

module.exports = router;