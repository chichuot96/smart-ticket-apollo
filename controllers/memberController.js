var Member = require('../models/member');
var Ticket = require('../models/ticket');
var Event = require('../models/event');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
const {check, validationResult} = require('express-validator/check');
const algorithName = 'sha256';

exports.validate = function (method) {

    switch (method) {
        case 'save': {
            var today = new Date();
            return [
                check('username', 'Name is required!').not().isEmpty().isLength({min:5}).withMessage('phải trên 5 kí tự').isLowercase().withMessage('phải chứa ít nhất 1 chữ cái thường'),
                check('email', 'Invalid email').exists().isEmail(),
                check('password','phải trên 5 kí tự').isLength({min:5}),
                check('age','invalid').isNumeric(),
            ]
        };
        case 'login': {
            var today = new Date();
            return [
                check('username', 'Name is required!').not().isEmpty().isLength({min:5}).withMessage('phải trên 5 kí tự').isLowercase().withMessage('phải chứa ít nhất 1 chữ cái thường'),
                check('password','phải trên 5 kí tự').isLength({min:5}),
            ], function (req,resp,next){
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return resp.status(422).json({ errors: errors.array() });
                }else next();
            }
        }
    }
}
exports.register = function (req, resp) {
    resp.render('client/member/register',{'msg':''});
}

var numTick= new Array();
exports.create = function (req, resp){
    Event.find({'userID': req.session._id}, function (err, listData) {
            if(listData.length) {
                for(var i=0;i<listData.length;i++){
                    Ticket.find({'eventID':listData[i]._id,'status':1},function(err,list){
                        numTick.push(list.length);
                    })
                }

                var rpdt = {
                    'listData': listData,
                    'ten': req.session.fullName,
                    'pic': req.session.avatarUrl,
                    'numTicket':numTick,
                    'msg':0
                };
                resp.render('client/member/credlist', rpdt);

            }
            else {
                var rpdt = {
                    'listData':0,
                    'ten' : req.session.fullName,
                    'pic' : req.session.avatarUrl,

                    'msg' : 'Bạn chưa tạo sự kiện nào. Hãy tạo ngay!'
                }
                resp.render('client/member/credlist', rpdt);
            }
        }

    )
}

var list = [];
var cnt = 0;
exports.getList = function (req, resp){
    Ticket.find({'userID': req.session._id},
        function (err, listData) {
            if(listData.length){
                cnt = listData.length;
                for (var i = 0; i <listData.length; i++){
                    Event.findById(listData[i].eventID, function (err, obj) {
                        list.push( obj);
                    })
                }
                var rpdt = {
                    'list': list,
                    'ten': req.session.fullName,
                    'count': cnt,
                    'pic': req.session.avatarUrl
                };
                if(list.length>=cnt){
                    resp.render('client/member/eventlist', rpdt);
                }
                else {
                    resp.redirect('/members/list');
                }
            }
            else {
                var rpdt = {
                    'list': 0,
                    'ten' : req.session.fullName,
                    'pic' : req.session.avatarUrl
                }
                resp.render('client/member/eventlist', rpdt);
            }
        })
}


exports.save = function (req, resp) {
    var obj = new Member(req.body);
    obj.role = 'user';
    const errors=validationResult(req);
    if (!errors.isEmpty()) {
        var rpdata={
            'msg': errors.array().msg,
            'username':obj.username
        }

        return resp.render('client/member/register',rpdata);
    }
    obj.save(function (err) {
        if (err) {
            return resp.status(500).send(err);
        } else {
            req.session.aID = obj._id;
            req.session.aEmail= obj.email;
            req.session.aname= obj.username;
            req.session.apass=req.body.password;

            return resp.redirect('/members/authenemail');
        }
    });

}
exports.authenemail = function(req,resp){
    var mailOptions = {
        from: 'smartticketapollo@gmail.com',
        to: req.session.aEmail,
        subject: 'Xác nhận email Smart Ticket   ',

        text: 'Chào mừng đến với Smart Ticket! Bạn hãy nhấn vào link sau để xác nhận tài khoản của bạn tại smart ticket  ' + 'http://localhost:8886/members/authenemail/'+ req.session.aID
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    resp.render('client/member/authenemail');
}
exports.authen = function(req,resp){
    if(req.params.id==req.session.aID){
        Member.authenticate(req.session.aname,req.session.apass,function (error, member) {
            if (error) {
                var rpdata= {
                    'msg': 'Bạn đã nhập sai tên đăng nhập hoặc mật khẩu ',
                    'username': req.body.username
                }
                resp.render('client/member/login',rpdata);
            } else if(!member){
                var rpdata= {
                    'msg': 'Bạn đã nhập sai tên đăng nhập hoặc mật khẩu  ',
                    'username': req.body.username
                }
                resp.render('client/member/login',rpdata);
            } else {
                req.session.username = member.username;
                req.session.avatarUrl = member.avatarUrl;
                req.session.fullName = member.fullName;
                req.session._id = member._id;
                req.session.role = member.role;
                resp.redirect('/');
            }
        });
    }else {
        resp.redirect('/members/authenemail');
    }
}
exports.login = function (req, resp) {
    if(req.session.username){
        resp.redirect('/');
    }else{
        resp.render('client/member/login',{'msg': '','username':''});
    }

}

exports.processLogin = function (req, resp) {
    Member.authenticate(req.body.username, req.body.password, function (error, member) {
        if (error) {
            var rpdata= {
                'msg': 'Bạn đã nhập sai tên đăng nhập hoặc mật khẩu ',
                'username': req.body.username
            }
            resp.render('client/member/login',rpdata);
        } else if(!member){
            var rpdata= {
                'msg': 'Bạn đã nhập sai tên đăng nhập hoặc mật khẩu  ',
                'username': req.body.username
            }
            resp.render('client/member/login',rpdata);
        } else {
            req.session.username = member.username;
            req.session.avatarUrl = member.avatarUrl;
            req.session.fullName = member.fullName;
            req.session._id = member._id;
            req.session.role = member.role;
            req.session.mail= member.email;
            resp.redirect('/');
        }
    });
}

exports.processLogout = function (req, resp) {
    req.session.destroy(function (err) {
        return resp.redirect('/');
    });
}



exports.getDetail = function (req, resp) {
    Member.findById(req.session._id, function (err, obj) {
        if (err) {
            return resp.status(500).send(err);
        } else {
            var responseData = {
                'obj': obj,
                'ten': req.session.fullName,
                'pic': req.session.avatarUrl
            };
            resp.render('client/member/profile', responseData);
        }
    });
}
exports.edit = function (req, resp) {
    Member.findById(req.session._id, function (err, obj) {
        if (err) {
            return resp.status(500).send(err);
        } else {
            var responseData = {
                'action': '/members/edit/',
                'obj': obj,
                'ten': req.session.fullName,
                'pic': req.session.avatarUrl
            };
            resp.render('client/member/edit', responseData);
        }
    });
}
exports.update = function (req, resp) {
    Member.findByIdAndUpdate(
        req.session._id,
        req.body,
        {new: false},
        function (err, obj) {
            if (err) {
                return resp.status(500).send(err);
            } else {
                resp.redirect('/members/profile');
            }
        });
}
exports.changepassword = function (req, resp) {
     var responseData = {
         'msg':'',
         'ten' : req.session.fullName,
         'pic' : req.session.avatarUrl
     }
    resp.render('client/member/changePass', responseData);
}
exports.changepass = function (req, resp) {
    Member.findById(req.session._id,function (err, obj) {
        var inputPassword = req.body.oldpassword;
        var salt = obj.salt;
        var passwordHash = obj.password;
        var algorith = crypto.createHmac(algorithName, salt);
        var passwordHashToCompare = algorith.update(inputPassword).digest('hex');
        if (err) {
            return resp.status(500).send(err);
        }
        else if (passwordHashToCompare===passwordHash) {
            var _salt = generateSalt(7); // tạo muối.
            var _algorith = crypto.createHmac(algorithName, _salt); // tạo thuật toán.
            var _passwordHash = _algorith.update(req.body.newpassword).digest('hex'); // băm chuỗi password đầu vào.
            Member.findByIdAndUpdate(req.session._id, {'password': _passwordHash, 'salt': _salt },
            {new : false},
            function (err, obj) {
                if (err) {
                    return resp.status(500).send(err);
                } else {
                    resp.redirect('/members/profile');
                }
            });
        } else {
            resp.render('client/member/changePass',{'msg' : 'Mật khẩu cũ không đúng!!!!', 'ten' :req.session.fullName, 'pic': req.session.avatarUrl});
        }
    })}

function generateSalt(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'smartticketapollo@gmail.com',
        pass: 'cothixinh'
    }
})
var events;
exports.enjoy= function(req,resp){
    if(req.session.fullName){
        Ticket.findOne({'userID':req.session._id},function(err, obj){
            Event.findById(obj.eventID, function (err, rep) {
                if (rep){
                    resp.redirect('/event/typeEvent?type='+ rep.typeEvent);
                }
                else {
                    resp.redirect('/');
                }
                }

            )
        })

    }
    else {
        resp.redirect('/');
    }
}

