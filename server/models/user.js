
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;
var oAuthTypes = [
  'github',
  'twitter',
  'facebook',
  'google',
  'linkedin',
  'uber'
];

/**
 * User Schema
 */

var PuserSchema = new Schema({
  name: { type: String, default: '' },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  email: { type: String, default: '' },
  username: { type: String, default: '' },
  provider: { type: String, default: '' },
  hashed_password: { type: String, default: '' },
  profilePicture: {type: String, default: ''},
  salt: { type: String, default: '' },
  authToken: { type: String, default: '' },
  uberid: {type: String, default: ''},
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  linkedin: {},
  uber: {},
  trips: [],
  matches: [],
  pushInfo: {}
});

/**
 * Virtuals
 */

PuserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() { return this._password });

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length;
};

// the below 5 validations only apply if you are signing up traditionally
//
//PuserSchema.path('name').validate(function (name) {
//  if (this.skipValidation()) return true;
//  return name.length;
//}, 'Name cannot be blank');
//
//PuserSchema.path('email').validate(function (email) {
//  if (this.skipValidation()) return true;
//  return email.length;
//}, 'Email cannot be blank');
//
//PuserSchema.path('email').validate(function (email, fn) {
//  var User = mongoose.model('Puser');
//  if (this.skipValidation()) fn(true);
//
//  // Check only when it is a new user or when email field is modified
//  if (this.isNew || this.isModified('email')) {
//    User.find({ email: email }).exec(function (err, users) {
//      fn(!err && users.length === 0);
//    });
//  } else fn(true);
//}, 'Email already exists');

//PuserSchema.path('username').validate(function (username) {
//  if (this.skipValidation()) return true;
//  return username.length;
//}, 'Username cannot be blank');
//
//PuserSchema.path('hashed_password').validate(function (hashed_password) {
//  if (this.skipValidation()) return true;
//  return hashed_password.length;
//}, 'Password cannot be blank');


/**
 * Pre-save hook
 */

PuserSchema.pre('save', function(next) {
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password) && !this.skipValidation()) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
})

/**
 * Methods
 */

PuserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },

  /**
   * Validation is not required if using OAuth
   */

  skipValidation: function() {
    return ~oAuthTypes.indexOf(this.provider);
  }
};

/**
 * Statics
 */

PuserSchema.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  load: function (options, cb) {
    options.select = options.select || 'name username';
    this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  }
}
//this is really terrible, but since I'm limited to one OR DB, it's a necessary hack
mongoose.model('Puser', PuserSchema );

