var express = require('express');
var router = express.Router();
var liveStreamController = require('../controllers/liveStreamController');

router.get('/', liveStreamController.index);

module.exports = router;
