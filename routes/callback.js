var express = require('express');
var router = express.Router();

//require our controllers
var callbackController = require('../controllers/callbackController');

/* GET callback page. */
router.get('/', callbackController.index);

module.exports = router;
