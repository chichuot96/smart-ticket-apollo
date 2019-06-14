var Event = require('../models/event');
var Ticket = require('../models/ticket');
require('jquery');
require('mongoose-pagination');


exports.create = function (req, resp) {
    if(req.session.username){
        var responseData = {
            'action': '/event/information',
            'obj': new Event(),
            'ten': req.session.fullName,
            'pic': req.session.avatarUrl
        }
        resp.render('event/eventForm', responseData);
    }else{
        resp.redirect('/members/login');
    }
}
exports.booking = function (req, resp) {
    if(req.session.fullName){
        Event.findById(req.params.id, function (err, obj) {
            if (err) {
                return resp.status(500).send(err);
            } else {
                Ticket.find({'eventID': req.params.id,'status':0}, function (err, listData) {
                    if (err) {
                        return resp.status(500).send(err);
                    }
                    else{
                        var responseData = {
                            'listData': listData,
                            'obj': obj,
                            'ten': req.session.fullName,
                            'pic': req.session.avatarUrl,
                            'id': req.params.id
                        };
                        resp.render('event/booking', responseData);
                    }
                })
            }
        });
    }else{
        resp.redirect('/members/login');
    }
}
exports.getList = function (req, resp) {
    var page = req.query.page||1;
    var limit = req.query.limit || 8;
    var responseData;
    var today= new Date();
    var keyword = req.query.keyword;
    var query;
    if (keyword) {
        var searchPara = {
            $text: {
                $search: keyword
            }
        };
        query = Event.find(searchPara);
    } else {
        query = Event.find();
    }
    query=query.where('status').equals(1).where('timeStart').gte(today);
    query.sort({timeStart: 1}).paginate(parseInt(page), parseInt(limit),
        function (err, listData, totalItem) {
            if(listData.length){
                responseData = {
                    'listData': listData,
                    'totalPage': Math.ceil(totalItem / limit),
                    'page': page,
                    'limit': limit,
                    'ten': req.session.fullName,
                    'pic': req.session.avatarUrl,
                    'keyword': keyword,
                    'role': req.session.role
                };
                resp.render('index', responseData);
            }else{
                resp.render('notFound', {'ten': req.session.name});
        }

        });
}

exports.save = function (req, resp) {
    var obj = new Event(req.body);
    obj.status= 0;
    obj.income = 0;
    obj.userID= req.session._id;
    obj.booked=0;
    obj.save(function (err) {
        if (err) {
            return resp.status(500).send(err);
        } else {
            req.session.numTicket=req.body.numTicket;
            return resp.redirect('/event/createlist/'+obj._id);
        }
    });
}
exports.typeEvent= function(req,resp){
    var page = req.query.page||1;
    var limit = req.query.limit || 8;
    var responseData;
    var today= new Date();
    var tp=req.query.type;
    Event.find({'typeEvent': req.query.type}).where('status').equals(1).where('timeStart').gte(today).sort({timeStart: 1}).paginate(parseInt(page), parseInt(limit),
        function (err, listData, totalItem) {
            responseData = {
                'listData': listData,
                'totalPage': Math.ceil(totalItem / limit),
                'page': page,
                'limit': limit,
                'ten': req.session.fullName,
                'pic': req.session.avatarUrl,
                'typeEvent': tp
            };
            resp.render('event/typeEvent', responseData);
        });
}

exports.getDetail = function (req, resp) {
    Event.findById(req.params.id, function (err, obj) {
        if (err) {
            return resp.status(500).send(err);
        } else {
            var responseData = {
                'obj': obj,
                'ten': req.session.fullName,
            };
            resp.render('event/eventForm', responseData);
        }
    });
}
exports.delete = function (req, resp) {
    Event.findByIdAndUpdate(
        req.params.id,
        {
            'status': -1
        },
        {
            new: false
        },
        function (err, obj) {
            if (err) {
                return resp.status(500).send(err);
            } else {
                resp.redirect('/event/list');
            }
        });
}
exports.edit = function (req, resp) {
    Event.findById(req.params.id, function (err, obj) {
        if (err) {
            return resp.status(500).send(err);
        } else {
            var responseData = {
                'action': '/event/edit/' + req.params.id,
                'obj': obj,
                'ten': req.session.fullName,
                'pic': req.session.avatarUrl
            };
            resp.render('event/eventForm', responseData);
        }
    });
}
exports.update = function (req, resp) {
    Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: false},
        function (err, obj) {
            if (err) {
                return resp.status(500).send(err);
            } else {
                resp.redirect('/');
            }
        });
}
exports.getListEvent = function (req, resp) {

    if(req.session.role=='admin'){
        var page = req.query.page||1;
        var limit = req.query.limit || 20;
        var responseData;
        Event.find().where('status').ne(1).paginate(parseInt(page), parseInt(limit),
            function (err, listData, totalItem) {
                responseData = {
                    'listData': listData,
                    'totalPage': Math.ceil(totalItem / limit),
                    'page': page,
                    'limit': limit,
                    'ten': req.session.fullName,
                    'pic': req.session.avatarUrl
                };
                resp.render('event/listevent', responseData);
            });
    }else{
        resp.redirect('/');
    }
}
exports.addEvent = function(req,resp){
    Event.findByIdAndUpdate(
        req.params.id,
        {
            'status': 1
        },
        {
            new: false
        },
        function (err, obj) {
            if (err) {
                return resp.status(500).send(err);
            } else {
                resp.redirect('/event/list');
            }
        });
}
exports.detail = function (req, resp){
    Event.findById(req.params.id, function (err, obj) {
        if (err) {
            return resp.status(500).send(err);
        } else {
            var responseData = {
                'obj': obj,
                'ten': req.session.fullName,
                'pic': req.session.avatarUrl
            };
            resp.render('event/SingleEvent', responseData);
        }
    });

}
exports.home = function(req,resp){
    resp.redirect('/home');
}


exports.processbooking = function(req,resp){
    if(req.session.fullName){
        req.session.money= req.body.payment;
        req.session.numtick=req.body.numTicket;
        req.session.eventID=req.params.id;
        Event.findById(req.session.eventID, function (err, obj) {
            if (err) {
                return resp.status(500).send(err);
            } else {
                req.session.income = obj.income;
                req.session.nameEvent = obj.name;
                var responseData = {
                    'obj': obj,
                    'ten': req.session.fullName,
                    'pic': req.session.avatarUrl,
                    'id': req.params.id,
                    'numtic' :req.session.numtick,
                    'mon': req.session.money
                };
                resp.render('event/bookingstep2', responseData);


            }
        });
    }else {
        resp.redirect('/members/login');
    }

    // resp.redirect('/order/payment');
}
