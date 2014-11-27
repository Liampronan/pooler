
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * User Schema
 */

var PmessageSchema = new Schema({
  toUberid: String,
  fromUberid: String,
  message: String,
  readByReceiver: Boolean
});

//this is really terrible, but since I'm limited to one OR DB, it's a necessary hack
mongoose.model('Pmessage', PmessageSchema);

