var Ticket = require('../models/ticket');
var Event = require('../models/event');


exports.create = function (req, resp) {
    for(var i=0;i<req.session.numTicket;i++){
        var obj = new Ticket({
            'eventID': req.params.id,
            'userID': '',
            'status' : 0
        });
        obj.save(function(err){
            if(err) return resp.status(500).send(err);
        });
    }

    resp.redirect('/members/profile');
}

exports.buy= function(req,resp){
    var query;
    query= Ticket.find({
        'userId':'',
        'eventId': req.params.id
    });
    if(query.limit>req.body.num){
        for(var i=0;i<req.body.num;i++){
            query[i].userId= req.session._id;

}
}
}
