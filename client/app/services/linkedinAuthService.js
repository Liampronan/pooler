angular.module('hitcher')
    .service('linkedinAuthService', ['$http', '$stateParams', '$q', '$location', 'config',
      function ($http, $stateParams, $q, $location, config) {

        this.authUrl = "localhost:9000/oauth/linkedin/";

        this.login =  function(){
          window.location.href = config['host'] + "/api/auth/linkedin";
        };

        this.isLoggedIn = function(){
          return $http.get('/api/auth/isLoggedIn')
        }

      }
    ])