angular.module('pooler')
  .service('nearbyService', ['$http', '$stateParams', '$q', '$location', '$rootScope', 'API_HOST', '$state', 'userService',
    '$ionicPlatform', '$cordovaGeolocation', '$window',
    function ($http, $stateParams, $q, $location, $rootScope, API_HOST, $state, userService, $ionicPlatform, $cordovaGeolocation, $window) {
      var data = {

        },
        _this = this;
      setUserCoords();

      this.getUserCoords = function(){
        var deferred = $q.defer();

        if (data['position']){
            deferred.resolve(data['position']);
          console.log(data['position']);
        } else {
            setUserCoords().then(function(position){
//            var position = {
//              coords: {
//                latitude: 37,
//                longitude: -122
//              }
//            }
            deferred.resolve(position);
            console.log(position);

            })
        }

        return deferred.promise;
      }

      function setUserCoords(){
        var deferred = $q.defer();
        navigator.geolocation.getCurrentPosition(function (position) {
//              var lat  = position.coords.latitude,
//                  long = position.coords.longitude;
          data['position'] = position;
          deferred.resolve(position)
        }, function(err) {
          // error
          console.log('errr', err);
          deferred.reject(err);
        });

        return deferred.promise


      }


      this.getTrips = function(coords, searchDistance){
        var deferred = $q.defer(),
            userUberid = userService.getUser().uberid;
        $http({
          url: API_HOST + '/trips/getNearby',
          method: "GET",
          params: {
            'userUberid': userUberid,
            'latitude': coords.latitude,
            'longitude': coords.longitude,
            'distance': searchDistance
          }
        })
          .then(function (success) {
            data['trips'] = success.data;
            deferred.resolve(data['trips']);
          })
        return deferred.promise
      }
      
      this.requestTrip = function(requestedTripInfo, requestedUserInfo, requestInfo){
        var deferred = $q.defer(),
            requestorUserInfo = userService.getUser();
        $http({
          url: API_HOST + '/trips/requestTrip',
          method: "POST",
          data: {
            'requestorUserInfo': requestorUserInfo,
            'requestedTripInfo': requestedTripInfo,
            'requestedUserInfo': requestedUserInfo,
            'requestInfo': requestInfo
          }
        })
          .then(function (success) {
            console.log(success);
//            data['trips'] = success.data;
            deferred.resolve(data['trips']);
          })
        return deferred.promise

      }

    }
  ]);

