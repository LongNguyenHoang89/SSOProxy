// load all the things we need
const FacebookStrategy = require('passport-facebook').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/user');
const configAuth = require('./auth');

module.exports = function (passport) {
  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // ========================================================================= FACEBOOK
  // ================================================================
  // =========================================================================
  passport.use(new FacebookStrategy({
    // pull in our app id and secret from our auth.js file
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
  },
  // facebook will send back the token and profile
  function (token, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function () {
      // find the user in the database based on their facebook id
      User.findOne({
        'oauthID': profile.id
      }, function (err, user) {
        // if there is an error, stop everything and return that ie an error connecting to the database
        if (err)
          return done(err);

        // if the user is found, then log them in
        if (user) {
          if ("production" !== process.env.NODE_ENV) {
            console.log('user found');
          }
          return done(null, user); // user found, return that user
        } else {
          if ("production" !== process.env.NODE_ENV) {
            console.log('cannot find user, insert new');
          }
          // if there is no user found with that facebook id, create them
          let newUser = new User();

          // set all of the facebook information in our user model
          newUser.oauthID = profile.id; // set the users facebook id
          newUser.access_token = token; // we will save the token that facebook provides to the user
          newUser.name = profile.displayName;
          newUser.provider = profile.provider; // we will save that the user choose Facebook as a provider

          // save our user to the database
          newUser.save(function (err) {
            if (err)
              throw err;

            // if successful, return the new user
            return done(null, newUser);
          });
        }
      });
    });
  }));

  // ========================================================================= GITHUB
  // ================================================================
  // =========================================================================
  passport.use(new GithubStrategy({
    // pull in our app id and secret from our auth.js file
    clientID: configAuth.githubAuth.clientID,
    clientSecret: configAuth.githubAuth.clientSecret,
    callbackURL: configAuth.githubAuth.callbackURL,
  },
  // Github will send back the token and profile
  function (token, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function () {
      // find the user in the database based on their Github id
      User.findOne({
        'oauthID': profile.id
      }, function (err, user) {
        // if there is an error, stop everything and return that ie an error connecting to the database
        if (err)
          return done(err);

        // if the user is found, then log them in
        if (user) {
          if ("production" !== process.env.NODE_ENV) {
            console.log('user found');
          }
          return done(null, user); // user found, return that user
        } else {
          if ("production" !== process.env.NODE_ENV) {
            console.log('cannot find user, insert new');
          }
          // if there is no user found with that Github id, create them
          let newUser = new User();

          // set all of the Github information in our user model
          newUser.oauthID = profile.id; // set the users Github id
          newUser.username = profile.username; // set the users Github id
          newUser.access_token = token; // we will save the token that Github provides to the user
          newUser.name = profile.displayName;
          newUser.provider = profile.provider; // we will save that the user choose Github as a provider

          // save our user to the database
          newUser.save(function (err) {
            if (err)
              throw err;

            // if successful, return the new user
            return done(null, newUser);
          });
        }
      });
    });
  }));

  // ========================================================================= GITHUB
  // ================================================================
  // =========================================================================
  passport.use(new TwitterStrategy({
    // pull in our app id and secret from our auth.js file
    consumerKey: configAuth.twitterAuth.clientID,
    consumerSecret: configAuth.twitterAuth.clientSecret,
    callbackURL: configAuth.twitterAuth.callbackURL,
  },
  // Github will send back the token and profile
  function (token, refreshToken, profile, done) {

    // asynchronous
    process.nextTick(function () {
      // find the user in the database based on their Github id
      User.findOne({
        'oauthID': profile.id
      }, function (err, user) {
        // if there is an error, stop everything and return that ie an error connecting to the database
        if (err)
          return done(err);

        // if the user is found, then log them in
        if (user) {
          if ("production" !== process.env.NODE_ENV) {
            console.log('user found');
          }
          return done(null, user); // user found, return that user
        } else {
          if ("production" !== process.env.NODE_ENV) {
            console.log('cannot find user, insert new');
          }
          // if there is no user found with that Github id, create them
          let newUser = new User();

          // set all of the Github information in our user model
          newUser.oauthID = profile.id; // set the users Github id
          newUser.username = profile.username; // set the users Github id
          newUser.access_token = token; // we will save the token that Github provides to the user
          newUser.name = profile.displayName;
          newUser.provider = profile.provider; // we will save that the user choose Twitter as a provider

          // save our user to the database
          newUser.save(function (err) {
            if (err)
              throw err;

            // if successful, return the new user
            return done(null, newUser);
          });
        }
      });
    });
  }));
};
