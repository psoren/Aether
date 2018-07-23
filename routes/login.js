var express = require('express');
var router = express.Router();

//require our controllers
var loginController = require('../controllers/loginController');

/* GET login page. */
router.get('/', loginController.index);

/* Handle button click */
router.get('/loginUser', loginController.loginUser);

module.exports = router;
