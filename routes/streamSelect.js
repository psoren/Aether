var express = require('express');
var router = express.Router();

//Require the controller
var streamSelectController = require('../controllers/streamSelectController');

//Get home page
router.get('/', streamSelectController.index);

//when someone submits a form from here, do this
router.post('/createStream', streamSelectController.createStream);

//when someone submits a form from here, do this
router.post('/joinStream', streamSelectController.joinStream);

module.exports = router;
