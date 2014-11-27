//https://login.uber.com/oauth/authorize

angular.module('pooler')
  .service('uberAuthService', ['$http', '$stateParams', '$q', '$location', 'API_HOST', '$window', 'userService',
    function ($http, $stateParams, $q, $location, API_HOST, $window, userService) {
      var clientId = "v8eZpgMwr5r8Hvw2FUub8oRESYrbNICH",
          _this = this,
        authUrl = API_HOST + '/auth/uber/',
        userProfile;


      this.login = function () {
        var deferred = $q.defer();
        //open IAB window
        var browserWindow = $window.open(authUrl, '_blank', 'location=no');
        // listen for IAB window finish loading
        browserWindow.addEventListener("loadstop", function () {
          //grab linkedin authcode from url response
          getAuthCodeFromResponse(browserWindow)
            .then(function (success) {
              console.log(userProfile);
              userService.setUser(userProfile);
              console.log('gotten user: ', userService.getUser());
            }, function (err) {

            })
        });
        return deferred.promise
      }

//      this.isLoggedIn = function(){
//        return $http.get(API_HOST + '/api/auth/isLoggedIn')
//      }

      // function called when the browser is closed
      function browserOnClose(output) {
//      get code from response url
//        var code = output.url.toString(), //non-google hack
//        var code = output.url[0].toString(),
        var code = output.url[0].toString(),
          uberIdRegex = /uberId=(.*)&f/,
          firstNameRegex = /&firstName=(.*)&/,
          profilePictureRegex = /&profilePicture=(.*)/,
          firstName = code.match(firstNameRegex)[1],
          uberId = code.match(uberIdRegex)[1],
          profilePicture = code.match(profilePictureRegex)[1],
          user = { firstName: firstName, uberid: uberId, profilePicture: profilePicture };

        console.log('user', user);
        console.log('user', user.firstName);
        console.log('user', user.uberid);
        console.log('user', user.profilePicture);
        userProfile = user;
      }

      function getAuthCodeFromResponse(browserWindow) {
        var deferred = $q.defer();
        // we get the url everythime the page loads
        browserWindow.executeScript({code: "document.URL" },

          //that url is passed to this function
          function (url) {
            var _url = url.toString();

            // we check if the callback page was reached
            if (_url.indexOf("localhost") > -1 && _url.indexOf('.uber.com') === -1) {
              console.log('URLL', _url);
              // the callback page was reached therefore it contains the json output returned from the server
              // we parse the html page to strip out the html tags and keep the json string
              browserWindow.executeScript({code: "document.body.innerHTML" }, function (response) {
                browserWindow.close();
                // we close the window and call this function with the url and the json output
                browserOnClose({url: url, response: response});
                deferred.resolve();
              });
            }
          }
        );
        return deferred.promise
      }

    }
  ]);