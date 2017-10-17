var mongoose = require("mongoose");

var fileSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  uploadDate: {
    type: Date
  }
})

var File = mongoose.model('File', fileSchema);

module.exports = File;
