var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// SCHEMAS
// -----------------------------------------------------------
var teamSchema = new mongoose.Schema({
  name: String,
  country: String
})

// var Team = module.exports = mongoose.model('Team', teamSchema);

mongoose.model('Team', teamSchema);
