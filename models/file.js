var mongoose = require("mongoose");

/*note: creating this database mainly to store file 'description' info entered by user*/
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
