var mongoose = require('mongoose');
var User = mongoose.model('Puser');
var Trip  = mongoose.model('Trip');
var ObjectId = require('mongoose').Types.ObjectId;
var utils = require('../../lib/utils');
var EventEmitter = require('events').EventEmitter,
  tripRequestEmitter;

exports.tripRequestEmitter = tripRequestEmitter = new EventEmitter();


exports.getNearby = function(req, res){
  var userUberid = req.query.userUberid,
      latitude = parseFloat(req.query.latitude),
      longitude = parseFloat(req.query.longitude),
      distance = req.query.distance;

  Trip.find({"departureLocation":
                  {
                    $near: {
                      $geometry: {
                        type: "Point" ,
                        coordinates: [ longitude , latitude ]
                      },
                      $maxDistance: distance
                    }
                  }
              },
            function(err, trips){
                if (err) console.error(err)
                var otherUserTrips = removeUserTrips(trips, userUberid);
                return res.json(200, otherUserTrips);
              }
           )
}


exports.requestTrip = function(req, res){
  var requestorUserInfo = req.body.requestorUserInfo,
      requestorUberid = requestorUserInfo.uberid,
      requestedTripInfo = req.body.requestedTripInfo,
      requestedUserInfo = req.body.requestedUserInfo,

      requestInfo = req.body.requestInfo,
      requestedUberid = requestedUserInfo.uuid,
      matchId = Math.random().toString(36).substr(2, 9),
      matchForRequestor = {
        id: matchId,
        userTrip: requestedTripInfo,
        matchTrip: requestedTripInfo,
        matchUser: requestedUserInfo,
        requestInfo: {
          requestorid: requestorUberid,
          accepted: 0,
          departureTime: requestInfo.departureTime,
          departureAddress: requestInfo.departureAddress,
          departureCoords: requestInfo.departureCoords
        }
      },
      matchForRequested = {
        id: matchId,
        userTrip: requestedTripInfo,
        matchTrip: requestedTripInfo,
        matchUser: requestorUserInfo,
        requestInfo: {
          requestorid: requestorUberid,
          accepted: 0,
          departureTime: requestInfo.departureTime,
          departureAddress: requestInfo.departureAddress,
          departureCoords: requestInfo.departureCoords
        }
      };

  console.log('requestedU', requestedUserInfo);

  requestedTripInfo.isMatchTrip = true;
  User.findOneAndUpdate({ uberid: requestedUberid },
                        { $addToSet: {matches: matchForRequested} },
    function(err, user){
      if (err) console.error(err);
      User.findOneAndUpdate({ uberid: requestorUberid },
                            { $addToSet: {matches: matchForRequestor, trips: requestedTripInfo} },
        function(err, user){
          if (err) console.error(err);
          console.log(user);
          tripRequestEmitter.emit('matchRequest', requestedUberid);
          return res.json(200, user)
        })
    })
}

exports.acceptRequest = function(req, res){
  var matchid = req.body.matchid;

  User.update({"matches.id": matchid}, {$set: {"matches.$.requestInfo.accepted": true}}, {multi: true}, function(err, user){
    if (err) console.error(err);
    return res.json(200, true)
  })
}

function removeUserTrips(trips, userUberid){
  var otherUserTrips = [];
  console.log(userUberid);
  if (trips){
    trips.forEach(function(trip){
      if(trip.user.uuid !== userUberid){
        otherUserTrips.push(trip)
      }
    })
  }

  return otherUserTrips
}





//testing ish
//Trip.find({$and: [
//  {
//    "departureLocation":
//    { $geoWithin: { $centerSphere: [ [ -122.41007200000001 , 37.7962317 ], .5/3959 ] } }
//  },
//  {"arrivalLocation":
//
//    { $geoWithin: { $centerSphere: [ [ -122.39575509999997 , 37.7831028 ], .5/3959 ] } }
//
//  },
//  {
//    $or:
//      [{
//        $and:
//          [
//            {"tripInfo.recurring": true},
//            { $or:
//              [
//                { $and: [ { "tripInfo.days.0": true }] },
//                { $and: [ { "tripInfo.days.1": true }] },
//                { $and: [ { "tripInfo.days.2": true }] },
//                { $and: [ { "tripInfo.days.3": true }] },
//                { $and: [ { "tripInfo.days.4": true }] }
//              ]
//            }
//          ]
//      },
//      { $and:
//          [
//            {"tripInfo.recurring": false},
//            {"tripInfo.date": "2014-11-23"}
//          ]
//      }]
//
//
//  }
//
//]})
