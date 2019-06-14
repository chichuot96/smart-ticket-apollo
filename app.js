var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var authenticate = require('./routes/authentication');
var permit = require('./routes/permission');

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://root:bimat1996@cluster0-f0ixd.gcp.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true });

var indexRouter = require('./routes/index');
var membersRouter = require('./routes/routeMembers');
var eventsRouter= require('./routes/event');
var orderRouter = require('./routes/order');
var expressValidator = require('express-validator');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());


app.use(session({
    secret: 'nodejs'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(authenticate);

app.use('/', indexRouter);
app.use('/members', membersRouter);
app.use('/event',eventsRouter);
app.use('/order', orderRouter);
app.use('/free', function (req, resp) {
    resp.send('Free space');
});

app.use('/user', permit('user', 'admin'), function (req, resp, next) {
    resp.send('Logged in user permission.' + req.loggedInMember.role);
});

app.use('/admin', permit('admin'), function (req, resp) {
    resp.send('Logged in admin permission.' + req.loggedInMember.role);
});
// app.use('/admin', permit('admin'), function (req, resp) {
//     resp.send('Okie Admin');
// })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  res.render('notFound',{'ten':req.session.name});
});

module.exports = app;

var port = 8886;

app.listen(port, function () {
    console.log('Server started at ' + port);
})
