
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var User = mongoose.model('Puser');
var Trip  = mongoose.model('Trip');
var ObjectId = require('mongoose').Types.ObjectId;
var utils = require('../../lib/utils');
var EventEmitter = require('events').EventEmitter,
    tripMatchEmitter;

mongoose.set('debug', true);

exports.tripMatchEmitter = tripMatchEmitter = new EventEmitter();

/**
 * Load
 */

exports.load = function (req, res, next, id) {
  var options = {
    criteria: { _id : id }
  };
  User.load(options, function (err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('Failed to load User ' + id));
    req.profile = user;
    next();
  });
};

/**
 * Create user
 */

exports.create = function (req, res) {
  var user = new User(req.body);
  user.provider = 'local';
  user.save(function (err) {
    if (err) {
      return res.render('users/signup', {
        error: utils.errors(err.errors),
        user: user,
        title: 'Sign up'
      });
    }

    // manually login the user once successfully signed up
    req.logIn(user, function(err) {
      if (err) return next(err);

      return res.json('/?user=' + user.uberid);
    });
  });
};

/**
 *  Show profile
 */

exports.show = function (req, res) {
  var user = req.profile;
  res.render('users/show', {
    title: user.name,
    user: user
  });
};

exports.signin = function (req, res) {};

/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login'
  });
};

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
};

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

/**
 * Session
 */

exports.session = login;

exports.createTrip = function (req, res) {
  var uberid = req.body.uberid,
      tripInfo= req.body.trip,
      id = new mongoose.Types.ObjectId();



  User.findOne({uberid: uberid}, function(err, user){
    if (err) return console.error(err)
    //TODO: check to make sure trip doesn't already exist
//    user.trips.push(trip);
    var trip = new Trip;
    tripInfo['_id'] = id;
    trip['departureLocation'] = {type: "Point", coordinates: [tripInfo.departureLocation.longitude, tripInfo.departureLocation.latitude]}
    trip['arrivalLocation'] = {type: "Point", coordinates: [tripInfo.arrivalLocation.longitude, tripInfo.arrivalLocation.latitude]}
    trip['tripInfo'] = tripInfo;
    if (tripInfo.departureTimeStamp){
      trip.tripInfo.departureTimeStamp = new Date(tripInfo.departureTimeStamp);
    }
    trip['user'] = user.uber;


    trip.save(function(err, trip){
      if (err) return console.error(err)
//      emitNewTrip(trip, linkedInUserId, user);
      user.trips.push(tripInfo);
      user.save(function(err, user){
        if (err) return console.error(err)
        checkForTripMatch(tripInfo, uberid, trip);
//      emitNewTrip(trip, linkedInUserId, user);
        return res.json(200, user);
      })
    })
  })

};

exports.getTrips = function (req, res) {
  var uberid = req.query.uberid;

  User.findOne({uberid: uberid}, {trips: [], "_id": 0}, function(err, user){
    if (err) return console.error(err)
    //TODO: check to make sure trip doens't already exist

    return res.json(200, user);
  })

};

exports.deleteTrip = function (req, res) {
  var uberid = req.query.uberid,
      tripIndex = req.query.tripIndex;

  User.findOne({uberid: uberid}, function(err, user){
    if (err) return console.error(err)
    var tripid = mongoose.Types.ObjectId(user.trips[tripIndex]['_id']);
    console.log('id', tripid);
    user.trips.splice(tripIndex, 1);


    user.save(function(err, user){
      if (err) return console.error(err);
      Trip.find({$and: [{"tripInfo._id": tripid}, {"user.uuid": uberid}]}).remove().exec(); // no cb.. is that bad?
      return res.json(200, user);
    })
  })

};

exports.updateTrip = function (req, res) {
  var uberid = req.body.uberid,
      tripIndex = req.body.tripIndex,
      tripInfo = req.body.trip,
      tripid =  mongoose.Types.ObjectId(tripInfo['_id']);
      tripInfo['_id'] = tripid;

  if (tripInfo.departureTimeStamp){
    trip.tripInfo.departureTimeStamp = new Date(tripInfo.departureTimeStamp);
  }

  var departureLocation = {type: "Point", coordinates: [tripInfo.departureLocation.longitude, tripInfo.departureLocation.latitude]}
  var arrivalLocation = {type: "Point", coordinates: [tripInfo.arrivalLocation.longitude, tripInfo.arrivalLocation.latitude]}

  console.log(tripid);

  Trip.findOneAndUpdate({"tripInfo._id": tripid},
                        {"departureLocation": departureLocation,
                         "arrivalLocation": arrivalLocation,
                         "tripInfo": tripInfo
                        },
                         function(err, trip){
                           if (err) console.error(err);
                           console.log('trip¡', trip);
                           User.findOneAndUpdate( {"trips": {$elemMatch: { '_id' : tripid } } },
                             { $set: {"trips.$": tripInfo }},
                             {"trips.$": 1, "_id": 0},
                             function(err, trip){
                               if (err) return console.error(err);
                               return res.json(200, trip);
                             })
                        }
                      )

};

exports.getUser = function(req, res){
  var uberid = req.query.uberid;
  console.log(uberid);


  User.findOne({uberid: uberid}, function(err, user){
    if (err) return console.error(err);

    return res.json(200, user)
  })
}

exports.updatePushInfo = function(req, res){
  var uberid = req.body.uberid,
      pushInfo = req.body.pushInfo;


  User.findOneAndUpdate({"uberid": uberid},
                        {"pushInfo": pushInfo},
                        function(err, user){
                            if (err) console.error(err);
                            return res.json(200, user)
                        })

}


/**
 * Login
 */

function login (req, res) {
  console.log('req', req);
  var redirectTo = req.session.returnTo ? req.session.returnTo : '/?uberId=' + req.user.uberid + '&firstName=' +
    req.user.firstName + '&profilePicture=' + req.user.profilePicture;
  delete req.session.returnTo;
  res.redirect(redirectTo);
};


function checkForTripMatch(tripInfo, userUberid, tripWithUser){
//  var distance = 0.5; //search within .5 miles
  if (!tripInfo.days) {
    tripInfo.days = [false, false, false, false, false, false, false];
  }
  if (tripInfo.departureTimeStamp){
    var timeLowerBound = new Date (tripInfo.departureTimeStamp.getTime() - tripInfo.bufferWindow * 60000),
        timeUpperBound = new Date (tripInfo.departureTimeStamp.getTime() + tripInfo.bufferWindow * 60000);
  }
  Trip.find({$and: [
    {
      "departureLocation":
      {
        $geoWithin:
        {
          $centerSphere:
            [
              [ tripInfo.departureLocation.longitude , tripInfo.departureLocation.latitude ],
              .5/3959 // search within 1/2 mile (converted to radians)
            ]
        }
      }
    },
    {
      "arrivalLocation":
      {
        $geoWithin:
        {
          $centerSphere:
            [
              [ tripInfo.arrivalLocation.longitude , tripInfo.arrivalLocation.latitude ],
              .5/3959
            ]
        }
      }

    },
    {   $or:
      [{
        $and:
          [
            {"tripInfo.recurring": true},
            { $or:
              [
                { $and: [ { "tripInfo.days.0": true }, { "tripInfo.days.0": tripInfo.days[0] } ] },
                { $and: [ { "tripInfo.days.1": true }, { "tripInfo.days.1": tripInfo.days[1] } ] },
                { $and: [ { "tripInfo.days.2": true }, { "tripInfo.days.2": tripInfo.days[2] } ] },
                { $and: [ { "tripInfo.days.3": true }, { "tripInfo.days.3": tripInfo.days[3] } ] },
                { $and: [ { "tripInfo.days.4": true }, { "tripInfo.days.4": tripInfo.days[4] } ] },
                { $and: [ { "tripInfo.days.5": true }, { "tripInfo.days.5": tripInfo.days[5] } ] },
                { $and: [ { "tripInfo.days.6": true }, { "tripInfo.days.6": tripInfo.days[6] } ] }
              ]
            },
            { "tripInfo.departureTimeStamp": {$gt: new Date(timeLowerBound.toISOString()) } },
            { "tripInfo.departureTimeStamp": {$lt: new Date(timeUpperBound.toISOString()) } }
          ]
      },
        {
          $and:
            [
              {"tripInfo.recurring": false},
              {"tripInfo.departureTimeStamp": {$gt: new Date(timeLowerBound.toISOString()) }},
              {"tripInfo.departureTimeStamp": {$lt: new Date(timeUpperBound.toISOString()) }}
            ]
        }]

    }

  ]},
    function(err, matchTrips){
      if (err) console.error(err)
      var otherUserMatchTrips = removeUserTrips(matchTrips, userUberid),
          matchUsersUberids = [userUberid]; //store ids for push notifications
      console.log(otherUserMatchTrips);
      otherUserMatchTrips.forEach(function(matchTrip){
        var matchId = Math.random().toString(36).substr(2, 9);
        addToUserMatches(userUberid, matchTrip, matchId, tripWithUser);
        addToUserMatches(matchTrip.user.uuid, tripWithUser, matchId, matchTrip);
        matchUsersUberids.push(matchTrip.user.uuid);
      })
      if (matchUsersUberids.length > 1){
        tripMatchEmitter.emit('tripMatch', matchUsersUberids);
      }

      return otherUserMatchTrips;
    }
  )
}

function removeUserTrips(trips, userUberid){
  var otherUserTrips = [];
  console.log(userUberid);
  trips.forEach(function(trip){
    if(trip.user.uuid !== userUberid){
      otherUserTrips.push(trip)
    }
  })
  return otherUserTrips
}
//TODO: remove match on delete/update
function addToUserMatches(userUberid, trip, matchId, userTrip){
      var matchInfo = {
                    "id": matchId,
                    requestorId: null,
                    accepted: 0,
                    userTrip: userTrip.tripInfo,
                    matchTrip: trip.tripInfo,
                    matchUser: trip.user
                  }


  User.findOneAndUpdate( {uberid: userUberid},
                         {
                          $addToSet: {matches: matchInfo}
                         }).exec()
}

