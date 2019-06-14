var express = require('express');
var router = express.Router();
var eventController=require('../controllers/eventController');
router.get('/', eventController.getList);
router.get('/home',eventController.getList);
module.exports = router;