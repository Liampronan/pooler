angular.module('hitcher')
    .service('linkedinDataService', ['$http', '$stateParams', '$q', '$location',
      function ($http, $stateParams, $q, $location) {
        var data = {
          user: null
        }

        this.setUserInfo = function(){
          var deferred = $q.defer();
          $http.get('/api/auth/user').then(function(success){
            data['user'] = success.data;
            deferred.resolve()
          })
          return deferred.promise
        }

        this.getUserInfo =  function(){
          return data['user']
        };

      }
    ])