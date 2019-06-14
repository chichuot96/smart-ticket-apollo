var Member = require('../models/member');

module.exports = function (req, resp, next) {
    if(req.session && req.session.username){
        Member.findOne({
            'username':req.session.username
        }, function (err, member) {
            console.log('Called here.');
            if(member){
                req.loggedInMember = member;
                console.log('Called here1.' + req.loggedInMember.username);
            }
            next();
        })
    }else{
        next();
    }
}