angular.module('pooler')
    .service('userService', ['$http', '$stateParams', '$q', '$location', 'linkedinDataService',
      function ($http, $stateParams, $q, $location, linkedinDataService) {
        var data = {
          user: null,
          trips: []
        }

        this.getUser = function(){
            return data['user']
        }

        this.setUser = function(){
          var deferred = $q.defer();
          retrieveUser().then(function(success){
            data['user'] = data['user']
            deferred.resolve()
          })
          return deferred.promise
        }

        this.create = function(){
          var deferred = $q.defer();
          var linkedInUserId = linkedinDataService.getUserInfo()['id'];
          $http.get('/api/user/create?linkedInUserId=' + linkedInUserId).then(function(success){
            data['user'] = success.data;
            deferred.resolve()
          })
          return deferred.promise
        }

        this.getTrips = function(){
            return data['trips']
        }

        this.setTrips = function(){
          var deferred = $q.defer();
          var linkedInUserId = linkedinDataService.getUserInfo()['id'];
          $http.get('api/user/trips?linkedInUserId=' + linkedInUserId).then(function(success){
            data['trips'] = success.data;
            deferred.resolve()
          })

          return deferred.promise
        }

        this.addTrip = function(departureCaltrainStop, arrivalStation){
          var linkedInUserId = linkedinDataService.getUserInfo()['id'];
          var deferred = $q.defer();
//        TODO: more RESTFUL pls..
          $http({
            url: '/api/user/addTrip',
            method: "POST",
            data: {
              'departureCaltrainStop': departureCaltrainStop,
              'arrivalStation': arrivalStation,
              'linkedInUserId': linkedInUserId
          }
          })
          .then(function(success){
            data['trips'].push(success.data);
            deferred.resolve()
          })
          return deferred.promise
        }

        function retrieveUser(){
          var deferred = $q.defer();
          var linkedInUserId = linkedinDataService.getUserInfo()['id'];
          $http.get('/api/user/find?linkedInUserId=' + linkedInUserId).then(function(success){
            data['user'] = success.data;
            deferred.resolve()
          })
          return deferred.promise
        }
      }
    ])