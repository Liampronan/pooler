angular.module('pooler')
  .service('nearbyService', ['$http', '$stateParams', '$q', '$location', '$rootScope', 'API_HOST', '$state', 'userService',
    '$ionicPlatform', '$cordovaGeolocation',
    function ($http, $stateParams, $q, $location, $rootScope, API_HOST, $state, userService, $ionicPlatform, $cordovaGeolocation) {
      var data = {

        },
        _this = this;
      setUserCoords();

      this.getUserCoords = function(){
        var deferred = $q.defer();

        if (data['position']){
            deferred.resolve(data['position']);
        } else {
            setUserCoords().then(function(position){
            deferred.resolve(position);
          })
        }

        return deferred.promise;
      }

      function setUserCoords(){
        var deferred = $q.defer();
        $ionicPlatform.ready(function() {
          $cordovaGeolocation
            .getCurrentPosition()
            .then(function (position) {
//              var lat  = position.coords.latitude,
//                  long = position.coords.longitude;
                data['position'] = position;
                deferred.resolve(position)
            }, function(err) {
              // error
            });
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

