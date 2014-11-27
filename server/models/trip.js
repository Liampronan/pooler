
/**
* Module dependencies.
*/

var mongoose = require('mongoose');
var config = require('../../config/config');

var utils = require('../../lib/utils');

var Schema = mongoose.Schema;


var Trip = new Schema({
  departureLocation: {},
  arrivalLocation: {},
  user:  {},
  tripInfo: {}
});


mongoose.model('Trip', Trip);
