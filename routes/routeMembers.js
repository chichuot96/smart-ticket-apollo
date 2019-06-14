var express = require('express');
var memberController = require('../controllers/memberController');
var router = express.Router();



router.get('/register', memberController.register);
router.post('/register',memberController.validate('save'), memberController.save);
router.get('/login', memberController.login);
router.post('/login',memberController.validate('login'), memberController.processLogin);
router.get('/logout', memberController.processLogout);
router.get('/profile', memberController.getDetail);
router.get('/edit', memberController.edit);
router.post('/edit', memberController.update);
router.get('/changepassword', memberController.changepassword);
router.post('/changepassword', memberController.changepass);
router.get('/list', memberController.getList);
router.get('/credlist', memberController.create);
router.get('/authenemail',memberController.authenemail);
router.get('/authenemail/:id',memberController.authen);
router.get('/enjoy', memberController.enjoy);
module.exports = router;