
var mongoose = require('mongoose');
var UberStrategy = require('passport-uber').Strategy;
var config = require('../config');
var User = mongoose.model('Puser');
var ID = 'v8eZpgMwr5r8Hvw2FUub8oRESYrbNICH';
var SECRET = 'AIS652KQo97pDD2l5o4xYBNlxxo1HXA4t-rWpbmM';


module.exports = new UberStrategy({
    clientID: ID,
    clientSecret: SECRET,
    callbackURL: "http://localhost:9000/auth/uber/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    var options = {
                    'uberid': profile.uuid
                  };
    console.log('access toke', accessToken );
    console.log('profileid', profile.id);
    console.log('profile', profile);
    User.findOne(options, function (err, user) { //TODO: test change from load to findOne for creating new user
      if (err) return done(err);
      if (!user) {
        user = new User({
          firstName: profile.first_name,
          lastName: profile.last_name,
          authToken: accessToken,
          refreshToken: refreshToken,
          email: profile.email,
          provider: 'uber',
          profilePicture: profile.picture,
          uberid:  profile.uuid,
          uber: profile
        });
        user.save(function (err) {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        console.log(user);
        return done(err, user);
      }
    });
  }
);
