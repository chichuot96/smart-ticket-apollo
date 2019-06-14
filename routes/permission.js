module.exports = function (...allowed) {

    function isAllowed(role) {
        console.log(allowed);
        console.log(role);
        console.log(allowed.indexOf(role));
        return allowed.indexOf(role) > -1;
    }

    return function (req, resp, next) {
        if(req.loggedInMember && isAllowed(req.loggedInMember.role)){
            next();

        } else {
            var err = new Error('Forbidden');
            err.status = 403;
            next(err);
        }
    }
}
