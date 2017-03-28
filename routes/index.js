//see https://github.com/tutsplus/passport-social/blob/master/routes/index.js

var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler 
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated())
    return next();
  // if the user is not authenticated then redirect him to the login page
  res.redirect('/');
}

module.exports = function (passport) {
  /* GET home page. */
  router.get('/', function (req, res) {
    // Display the Login page with any flash message, if any
    res.render('index', { message: req.flash('message') });
  });

  /* GET Home Page */
  router.get('/profile', isAuthenticated, function (req, res) {
    res.render('profile', { user: req.user });
  });

  /* Handle Logout */
  router.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // route for facebook authentication and login
  // different scopes while logging in
  router.get('/auth/facebook',
    passport.authenticate('facebook', { scope: 'email' }
    ));

  // handle the callback after facebook has authenticated the user
  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    })
  );

  return router;
}
