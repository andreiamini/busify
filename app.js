var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodeio = require('node.io')

var routes = require('./routes/index');
var users = require('./routes/users');
var buses = require('./routes/buses');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/buses', buses);

app.post('/buses', function(req, res) {
            nodeio.scrape(function() {
        var userinput = req.body.busstopcode;
        this.getHtml('http://www.nextbuses.mobi/WebView/BusStopSearch/BusStopSearchResults/' + userinput, function(err, $) {
            if (!err) {
                var busNumberInit = [];
                $('.Stops').each(function(title) {
                 busNumberInit.push(title.text);
                });
                var busTime = [];
                $('.Number .Stops a').each(function(title) {
                 busTime.push(title.text);
                });
                var busNumber = [];
                for (var i = 0; i < busNumberInit.length; i++) {
                  if (busNumberInit[i] !== undefined && busNumberInit[i] !== null && busNumberInit[i] !== "") {
                    busNumber.push(busNumberInit[i]);
                  }
                 }
              var bus = busTime.map(function(item,i) {
               return item +": "+ busNumber[i];
              });
               console.log(bus);
               res.render('buses', {busData: bus});
            }
          if(err) {
            res.send("Sorry. We could not get a timetable for that bus stop code.");
          }
        });
    });
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
