var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
})

userSchema.methods.comparePassword = function(candidatePassword, next) {
  let isMatch = this.password === candidatePassword;
  next(null, isMatch);
};

var User = mongoose.model('User', userSchema)

module.exports = User;
