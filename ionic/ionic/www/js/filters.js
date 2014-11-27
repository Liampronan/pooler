var app = angular.module('pooler');

app.filter('showTripDays', function () {
  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return function (tripDays) {

    var output = "";
    tripDays.forEach(function (value, index, arr) {
      //return full day if it's only day for trip
      if (arr.reduce(sumDays) === 1){
        var dayIndex = arr.indexOf(true);
        return output = days[dayIndex];
      }
      //return range if M-Su or M-F; TODO: generalize this so that it handles any range of days (e.g, Tu-F)
      if (arr.indexOf(false) === -1) {
        return output = "M-Su";
      } else if (arr.slice(0,5).indexOf(false) === -1 && !arr[5] && !arr[6]){
        return output = "M-F";
      }
      //return comma separated day shorthand (Tu., F.)
      if (tripDays[index]) {
        if (index > 0 && output !== "") { //don't prepend comma for M or if first day
          output += ", ";
        }
        if (index == 1 || index == 3 || index == 5 || index == 6) {
          output += days[index].slice(0, 2) + "."; //Tu, Th, Sa, Su
        } else {
          output += days[index][0] + "."; //M, W, F
        }
      }
    })
    return output;
  }

});

app.filter('formatDateOnetimeTrip', function () {
  return function(date){
    var unformattedDate = moment(date);
    return unformattedDate.format("dddd, MM/D");
  }
});

app.filter('formatTime', function () {
  return function(time){
    var unformattedTime = moment(time, "HHmm");
    return unformattedTime.format("h:mm a")
  }
});
//TODO: more robust formatter
app.filter('formatStreetAddress', function () {
  return function(address){
    if (address === undefined) return;
    return address.replace('Street', 'St.').replace('San Francisco', 'SF').replace(', USA', '')
      .replace('International', 'Int\'l').replace(' San Francisco,', '');
  }
});

app.filter('displayStreet', function () {
  return function(address){
    if (address === undefined) return;
    return address.split(',')[0]
  }
});
//TODO: expand for multiple matches (change foreach to add to array of trip's matches)
app.filter('matchForTrip', function ($filter) {
  return function(user, trip){
    var matches = user.matches,
        uberid = user.uberid,
        searchCriteria = {},
        matchInfo;
    searchCriteria[uberid] = trip["_id"];

    angular.forEach(matches, function(match){
      if (match.userTrip["_id"] === trip['_id'] || (match.matchTrip["_id"] === trip["_id"] && trip.isMatchTrip)){
        matchInfo = match;
      }
    })
    return matchInfo;
  }
});

app.filter('matchUser', function ($filter) {
  return function(trip, users, currentUserUberid){
    var matchUserUberid;
    angular.forEach(trip.users, function(userTripInfo){
      var tripUserUberid = Object.keys(userTripInfo)[0];
      if (tripUserUberid !== currentUserUberid){
        matchUserUberid = tripUserUberid;
      }
    });
    return $filter('filter')(users, {uberid: matchUserUberid}, true)[0];
  }
});

app.filter('tripForMatch', function ($filter) {
  return function(trip, user){
    var matchTripid;
    angular.forEach(trip.users, function(userTripInfo){
      var tripUserUberid = Object.keys(userTripInfo)[0];
      if (tripUserUberid === user.uberid){
        matchTripid = userTripInfo[tripUserUberid];
      }
    });
    return $filter('filter')(user.trips, {"_id": matchTripid}, true)[0];
  }
});

app.filter('pluralizeDay', function () {
  return function(tripDays){
    var output;
    if (tripDays.reduce(sumDays) === 1){
      output = 'Day'
    } else {
      output = 'Days'
    }
    return output
  }
});

function sumDays(sum, day){
  return sum + 1 * day
}
