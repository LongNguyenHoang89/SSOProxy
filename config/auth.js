const util = require('util');

module.exports = {
  'facebookAuth': {
    'clientID': '246123952519729', // your App ID
    'clientSecret': '351182a0d242dc69b271f160257ad393', // your App Secret
    'callbackURL': `https://localhost:${process.env.PORT || 8080}/auth/facebook/callback`
  },
  'githubAuth': {
    'clientID': '4b08e616e651ba3617d5', // your App ID
    'clientSecret': 'a29b12b6544d1b52696cc7453469345db8739af8', // your App Secret
    'callbackURL': `https://127.0.0.1:${process.env.PORT || 8080}/auth/github/callback`
  },
  'twitterAuth': {
    'clientID': '7sdne0Uyk1Q8bBuwsudWof3TI', // your App ID
    'clientSecret': '7ovbcyqlyVAmFnUKcASUN9R4mrtZ8pwmllNxv5b9b4ha3HFXCc', // your App Secret
    'callbackURL': `https://127.0.0.1:${process.env.PORT || 8080}/auth/twitter/callback`
  }
}
