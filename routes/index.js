//see https://github.com/tutsplus/passport-social/blob/master/routes/index.js

var express = require('express');
var router = express.Router();
var http = require('http')

var isAuthenticated = function (req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler Passport adds this method
  // to request object. A middleware is allowed to add properties to request and response objects
  if (req.isAuthenticated())
    return next();

  // if the user is not authenticated then redirect him to the login page
  res.redirect('/');
}

module.exports = function (passport) {
  router.get('*', function (req, res, next) {
    // just use boolean for loggedIn
    res.locals.isLoggedIn = (req.isAuthenticated())
      ? true
      : false;

    next();
  });
  router.get('/', function (req, res) {
    // Display the Login page with any flash message, if any
    res.render('index', {message: req.flash('message')});
  });

  /* GET Home Page */
  router.get('/profile', isAuthenticated, function (req, res) {
    var postData = `lookup ${req.user.username}@${req.user.provider}`
    var options = {
      hostname: 'localhost',
      port: process.env.CONIKSCLIENT_PORT || 3001,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    let coniks_req = http.request(options, (coniks_res) => {
      coniks_res.setEncoding('utf8');
      let message = ''
      coniks_res.on('data', (chunk) => {
        switch (coniks_res.statusCode) {
          case 404:
            message = 'You are not yet registered in CONIKS'
            break;
          case 200:
            message = 'You are already registered in CONIKS'
            break;
          case 500:
          default:
            message = 'Something strange happened, cannot know if you are registered or not ... '
            if ("production" !== process.env.NODE_ENV) {
              console.log(`CONIKS Client lookup: [${coniks_res.statusCode}] ${chunk}`);
            }
        }
        res.render('profile', {
          user: req.user,
          coniks_message: message
        });
      });
    });

    coniks_req.on('socket', function (socket) {
      socket.setTimeout(4000);
      socket.on('timeout', function () {
        req.abort();
      });
    });

    coniks_req.on('error', (err) => {
      if ("production" !== process.env.NODE_ENV) {
        if (err.code === "ECONNRESET") {
          console.log("Timeout occurs");
        } else {
          console.log(`problem with request: ${err.message}`);
        }
      }
      let message = "The CONIKS Client is down, cannot know if you are already registered ..."
      res.render('profile', {
        user: req.user,
        coniks_message: message
      });
    });

    // write data to request body
    coniks_req.write(postData);
    coniks_req.end();
    return
  });

  /* Handle Coniks registration */
  router.get('/coniks', isAuthenticated, function (req, res) {
    res.render('coniks', {
      username: req.user.username,
      provider: req.user.provider
    });
  });

  /* Handle Logout */
  router.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // route for facebook authentication and login different scopes while logging in
  router.get('/auth/facebook', passport.authenticate('facebook'));

  // handle the callback after facebook has authenticated the user
  router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

  // route for facebook authentication and login different scopes while logging in
  router.get('/auth/github', passport.authenticate('github'));

  // handle the callback after github has authenticated the user
  router.get('/auth/github/callback', passport.authenticate('github', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

  // route for facebook authentication and login different scopes while logging in
  router.get('/auth/twitter', passport.authenticate('twitter'));

  // handle the callback after github has authenticated the user
  router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

  return router;
}
