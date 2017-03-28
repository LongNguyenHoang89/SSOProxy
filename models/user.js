var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	fb: {
		id: String,
		access_token: String,
		name: String,
		email: String
	},
});