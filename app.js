const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator')
const https = require('https');
const fs = require('fs')

// Database configuration
const dbConfig = require('./config/database');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise
mongoose.connect(dbConfig.url);

const port = process.env.PORT || 8080;
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Configuring passport
const passport = require('passport');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
app.use(expressSession({
  secret: 'foo',
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000
  },
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());

const initPassport = require('./config/passport')(passport);

// uncomment after placing your favicon in /public app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const routes = require('./routes/index')(passport);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = "production" !== process.env.NODE_ENV
    ? err
    : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const key = fs.readFileSync('keys/private.key');
const cert = fs.readFileSync('keys/localhost.crt');
const options = {
  key: key,
  cert: cert
};
https.createServer(options, app).listen(port);
console.log(`Server started on port: ${port}`);
