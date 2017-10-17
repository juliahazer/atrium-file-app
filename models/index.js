var mongoose = require("mongoose");
// mongoose.set('debug', true)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/atrium-files', {
  useMongoClient: true,
});

mongoose.Promise = Promise

module.exports.File = require("./file")
module.exports.User = require("./user")
