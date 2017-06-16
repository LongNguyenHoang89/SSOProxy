//see https://github.com/tutsplus/passport-social/blob/master/routes/index.js

const express = require('express');
const router = express.Router();
const https = require('https')
const util = require('util')
const request = require('request')

const isLoggedIn = function (req, res, next) {
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
    if (req.isAuthenticated()) {
      res.redirect('/profile')
    } else {
      res.render('index');
    }
  });

  router.get('/profile', isLoggedIn, function (req, res) {
    var postData = `lookup ${req.user.username}@${req.user.provider}`
    var options = {
      hostname: 'localhost',
      port: process.env.CONIKSCLIENT_PORT || 3001,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(postData)
      },
      rejectUnauthorized: false
    };
    var coniks_req = https.request(options, (coniks_res) => {
      coniks_res.setEncoding('utf8');
      let message = ''
      let isConiksUp = true;
      let isRegistered = false;
      coniks_res.on('data', (chunk) => {
        switch (coniks_res.statusCode) {
          case 404:
            message = 'You are not yet registered in CONIKS'
            break;
          case 200:
            message = 'You are already registered in CONIKS'
            isRegistered = true;
            break;
          case 500:
          default:
            message = 'Something strange happened, cannot know if you are registered or not ... '
            isConiksUp = false;
            if ("production" !== process.env.NODE_ENV) {
              console.log(`CONIKS Client lookup: [${coniks_res.statusCode}] ${chunk}`);
            }
        }
        res.render('profile', {
          user: req.user,
          coniks_status: {
            isConiksUp: isConiksUp,
            isRegistered: isRegistered,
            message: message
          }
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
      let isConiksUp = false;
      let isRegistered = undefined;
      let message = "The CONIKS Client or CONIKS Server is down, cannot know if you are already registered ..."
      res.render('profile', {
        user: req.user,
        coniks_status: {
          isConiksUp: isConiksUp,
          isRegistered: isRegistered,
          message: message
        }
      });
    });

    // write data to request body
    coniks_req.write(postData);
    coniks_req.end();
    return
  });

  /* Handle Coniks registration */
  router.get('/coniks', isLoggedIn, function (req, res) {
    res.render('coniks', {
      username: req.user.username,
      provider: req.user.provider,
      access_token: req.user.access_token
    });
  });

  router.post('/coniksRegistration', function (req, res) {
    console.log(req.body)
    req.checkBody('Auth.Username', 'Wrong JSON schema').notEmpty().withMessage(`"Username" in "Auth" is required`)
    req.checkBody('Auth.AccessToken', 'Wrong JSON schema').notEmpty().withMessage(`"AccessToken" in "Auth" is required`).isAlphanumeric().withMessage(`"AccessToken" in "Auth" must be alphanumeric`)
    req.checkBody('ConiksRequest', 'Wrong JSON schema').notEmpty().withMessage(`"ConiksRequest" is required`)
    req.getValidationResult().then(function (result) {
      if (!result.isEmpty()) {
        errors = util.inspect(result.useFirstErrorOnly().array())
        res.status(400).send(`Invalid format: ${errors}\n`);
        return;
      }
      const msg = req.body
      const usernameAtProvider = msg.Auth.Username
      const lastIndex = usernameAtProvider.lastIndexOf("@")
      const username = usernameAtProvider.substring(0, lastIndex)
      const provider = usernameAtProvider.substring(lastIndex + 1);
      const accessToken = msg.Auth.AccessToken
      const coniksRegistrationMsg = msg.ConiksRequest

      const User = require('../models/user');
      User.count({
        "username": username,
        "provider": provider,
        "access_token": accessToken
      }, function (err, count) {
        if (count < 1) {
          res.status(401).send("Wrong Authentication !")
        } else if (count > 1) {
          console.log(`Found more than one user with given username and access token : ${username} - ${provider} - ${accessToken}`)
          res.status(500).send("Internal error !")
        } else {
          const coniksReq = createConiksRequest(JSON.stringify(coniksRegistrationMsg))
          coniksReq.on('error', (err) => {
            if ("production" !== process.env.NODE_ENV) {
              if (err.code === "ECONNRESET") {
                console.log("Timeout occurs");
              } else {
                console.log(`Problem with request: ${err.message}. Is ConiksServer up ?`);
              }
            }
            console.log("Abort")
            res.status(500).send("Is ConiksServer up ?")
          });
          coniksReq.pipe(res);
        }
      });
    });
  });

  /* Handle Logout */
  router.get('/signout', function (req, res) {
    // req.session.destroy()
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

function createConiksRequest(msg) {
  const options = {
    uri: process.env.CONIKSSERVER || "https://localhost:8400",
    agentOptions: {
      rejectUnauthorized: false
    },
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(msg)
    },
    json: true,
    body: JSON.parse(msg),
    timeout: 4000
  };
  const coniksReq = request.post(options)
  return coniksReq
}
