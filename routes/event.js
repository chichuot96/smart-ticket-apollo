var express = require('express');
var router = express.Router();
var eventController = require('../controllers/eventController');
var ticketController = require('../controllers/ticketController');


router.get('/information', eventController.create);

router.post('/information', eventController.save);

router.get('/edit/:id', eventController.edit);

router.get('/typeEvent', eventController.typeEvent);

router.post('/edit/:id', eventController.update);

router.get('/list', eventController.getListEvent);

router.get('/detail/:id', eventController.detail);

router.get('/addEvent/:id',eventController.addEvent);

router.get('/createlist/:id',ticketController.create);

router.get('/booking/:id', eventController.booking);

router.post('/booking/:id',eventController.processbooking);

router.post('/order/cod', eventController.done);



module.exports = router;
