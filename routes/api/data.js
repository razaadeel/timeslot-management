const router = require('express').Router();

const dataController = require('../../controllers/data');

const db = require('../../models/index');

//get days and states
router.get('/initial-data', dataController.daysAndStates);

// //GET cities by state code
router.get('/cities/:stateCode', dataController.citiesOfState);

// //GET timeslots by city, day, channel 
router.get('/timeslots', dataController.getAvailableTimeslots);

router.get('/chargify-user', dataController.getChargifyUser);

module.exports = router;