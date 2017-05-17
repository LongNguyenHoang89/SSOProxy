var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
  oauthID: Number,
  access_token: String,
  name: String,
  username: String,
  provider: String,
});
