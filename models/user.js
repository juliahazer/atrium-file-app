var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
});

var User = mongoose.model('User', userSchema)

module.exports = User;
