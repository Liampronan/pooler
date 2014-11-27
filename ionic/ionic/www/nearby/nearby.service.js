angular.module('pooler')
  .service('nearbyService', ['$http', '$stateParams', '$q', '$location', '$rootScope', 'API_HOST', '$state', 'userService',
    function ($http, $stateParams, $q, $location, $rootScope, API_HOST, $state, userService) {
      var data = {

        },
        _this = this;


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

