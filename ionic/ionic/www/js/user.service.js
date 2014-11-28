angular.module('pooler')
  .service('userService', ['$http', '$stateParams', '$q', '$location', '$rootScope', 'API_HOST', 'localStorageService',
    '$ionicPopup', '$state',
    function ($http, $stateParams, $q, $location, $rootScope, API_HOST, localStorageService, $ionicPopup, $state) {
      var data = {
          user: {
          }
        },
        _this = this;

//      TODO: look into this getting called twice on initial load..
      this.getUser = function () {
        return data.user;
      };

//      _this.getUser().then(function(success){
//        _this.getMatchUsers();
//        retrieveTripRiders();
//      })

      this.getMessages = function () {
        return data['messages'];
      };

      this.getTrips = function () {
        return data['user']['trips'];
      };

      this.getMatchesUsers = function(){
          return data['matchesUsers'];
      };

      this.setACMRegid = function(ACMRegid){
        data['ACMRegid'] = ACMRegid;
      }

      this.setAPNRegid = function(APNRegid){
        data['APNRegid'] = APNRegid;
      }

      this.updatePushInfo = function(){
          var deferred = $q.defer(),
              regid = data['ACMRegid'] || data['APNRegid'],
              device = data['ACMRegid'] ? 'Android' : 'iOS',
              uberid = data['user']['uberid'],
              pushInfo = {
                regid: regid,
                device: device
              };

        $http({
          url: API_HOST + '/users/updatePushInfo',
          method: "POST",
          data: {
            'uberid': uberid,
            'pushInfo': pushInfo
          }
        })
          .then(function (success) {
            deferred.resolve(success.data)
          })

        return deferred.promise
      }

      this.setUser = function (user, bustCache) {
        var storedUser = localStorageService.get('user'),
            deferred = $q.defer();
        //set initial user after uber login
        if (user && !bustCache) {
          data.user = user;
          localStorageService.set('user', user);
          deferred.resolve(user)
        } else if (storedUser && !data.user.uberid && !bustCache) { //retrieve user from localstorage
          data.user = storedUser;
          deferred.resolve(data.user)
        } else { //retrieve user from server
          data.user = storedUser;
          retriveUser(bustCache).then(function(user){
           if (user) deferred.resolve(user);
           if (!user) deferred.resolve();
          })
        }
//        retriveTrips();
        return deferred.promise
      }

//      _this.setUser();

      this.createTrip = function (trip) {
        var uberid = data['user']['uberid'],
            deferred = $q.defer();
        trip.departureLocation = formatLocation(trip.departureLocation);
        trip.arrivalLocation = formatLocation(trip.arrivalLocation);
        trip = formatDepartureInfo(trip);

//        TODO: more RESTFUL pls..
        $http({
          url: API_HOST + '/users/createTrip',
          method: "POST",
          data: {
            'trip': trip,
            'uberid': uberid
          }
        })
          .then(function (success) {
            console.log('trip added?', success.data);
            data['user']['trips'] = data['user']['trips'] || [];
            data['user']['trips'] = success.data.trips;
            localStorageService.set('user', data['user']);
//            retrieveTripRiders();
            deferred.resolve()
          })
//          data['trips'].push({
//            departureCaltrainStop: departureCaltrainStop,
//            arrivalStation: arrivalStation,
//            tripDays: tripDays
//          })
        return deferred.promise
      }

      this.updateTrip = function (trip, tripIndex) {
        console.log('index', tripIndex);
        var uberid = data['user']['uberid'],
            deferred = $q.defer();
        console.log(trip);
        trip.departureLocation = formatLocation(trip.departureLocation);
        trip.arrivalLocation = formatLocation(trip.arrivalLocation);
        trip = formatDepartureInfo(trip);

//        TODO: more RESTFUL pls..
        $http({
          url: API_HOST + '/users/updateTrip',
          method: "POST",
          data: {
            'trip': trip,
            'uberid': uberid,
            'tripIndex': tripIndex
          }
        })
          .then(function (success) {
            console.log('success ¡', success);
            data['user']['trips'][tripIndex] = success.data.trips[0];
            localStorageService.set('user', data['user']);
//            retrieveTripRiders();
            deferred.resolve()
          });
        return deferred.promise
      }

      this.deleteTrip = function(trip){
        var deferred = $q.defer(),
          uberid = data['user']['uberid'],
          trips = data['user']['trips'],
          tripIndex = trips.indexOf(trip);

        $http({
          url: API_HOST + '/users/deleteTrip',
          method: "DELETE",
          params: {
            'uberid': uberid,
            'tripIndex': tripIndex
          }
        }).then(function (success) {
            data['user']['trips'] = success.data.trips;
            deferred.resolve(success.data.trips);
          }, function (error) {

          });

        return deferred.promise
      }

      this.logout = function () {
        localStorageService.clearAll();
        data = {
          user: {}
        }
      }

      this.acceptRequest = function(matchid){
        $http({
          url: API_HOST + '/trips/acceptRequest',
          method: "POST",
          data: {
            'matchid': matchid
          }
        })
        .then(function (success) {
          console.log('match accepted?', success.data);
          deferred.resolve()
        })
        return deferred.promise
      }

//      this.setACMRegid = function(ACMRegid){
//        data['ACMRegid'] = ACMRegid;
//      }
//
//      this.setAPNRegid = function(APNRegid){
//        data['APNRegid'] = APNRegid;
//      }

      function formatLocation(location){
        if (!location.geometry) return location // for updates: return location as-is b/c it's already formatted
        var formattedAddress = location.formatted_address,
            longitude = location.geometry.location.B,
            latitude = location.geometry.location.k,
            trip = {
              type: "Point",
              longitude: longitude,
              latitude: latitude,
              formattedAddress: formattedAddress

            }
        return trip
      }

      function formatDepartureInfo(trip){
        if (trip.recurring){
          delete trip.date //delete date b/c this is recurring trip, so we'll match on days
          //hack to store/query recurring trips - only care about time for these, so use constant date (hbd liam!)
          trip.departureTimeStamp =  moment("1990-04-27" + " " + trip.departureTime).format()
        } else {
          delete trip.days //delete days b/c this is one-time trip, so we'll match on date
          trip.departureTimeStamp = moment(trip.date + " " + trip.departureTime).format();
        }
        return trip
      }

      function retriveTrips(){
        var uberid = data['user']['uberid'],
          deferred = $q.defer();

//        TODO: more RESTFUL pls..
        $http({
          url: API_HOST + '/users/getTrips',
          method: "GET",
          params: {
            'uberid': uberid
          }
        })
          .then(function (success) {
            data['user']['trips'] = data['user']['trips'] || [];
            data['user']['trips'] = success.data.trips;
            localStorageService.set('user', data['user']);
            deferred.resolve()
          })
        return deferred.promise
      }

      function getUser(uberid){
        var deferred = $q.defer();
        $http({
          url: API_HOST + '/users/getUser',
          method: "GET",
          params: {
            'uberid': uberid
          }
        })
        .then(function (success) {
          data['matchesUsers'] = data['matchesUsers'] || [];
          data.matchesUsers.push(success.data);
          deferred.resolve();
        })
        return deferred.promise
      }

      //TODO: incorporate getUser into this -- they are basically thesame
      function retriveUser(bustCache){
        var uberid,
            deferred = $q.defer();
        if (data['user'] && data['user']['uberid']){
          uberid = data['user']['uberid'];
          //        TODO: more RESTFUL pls..
          $http({
            url: API_HOST + '/users/getUser',
            method: "GET",
            params: {
              'uberid': uberid
            }
          })
          .then(function (success) {
            data['user'] = success.data;
            localStorageService.set('user', data['user']);
            deferred.resolve(data['user'])
          })
        } else {
          deferred.resolve();
        }

        return deferred.promise
      }

      this.retrieveMatchesUsers = function(){
        var promises = [],
            uberids = getMatchesUberIds();
        for (uberid in uberids){
          promises.push(getUser(uberids[uberid]));
        }
        return $q.all(promises)
      }

      function getMatchesUberIds(){
        var uberids = [],
            matches = data.user.matches;

        angular.forEach(matches, function(match){
          angular.forEach(match.users, function(matchUser) {
            var uberid = Object.keys(matchUser)[0];
            if (uberid !== data.user.uberid){
              uberids.push(uberid);
            }
          });
        });

        return uberids
      }

    }
  ]);

