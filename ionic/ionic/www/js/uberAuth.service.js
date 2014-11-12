//https://login.uber.com/oauth/authorize

angular.module('pooler')
  .service('uberAuthService', ['$http', '$stateParams', '$q', '$location', 'API_HOST', '$window',
    function ($http, $stateParams, $q, $location, API_HOST, $window) {
      var clientId = "v8eZpgMwr5r8Hvw2FUub8oRESYrbNICH",
          authCode = null,
          _this = this,
          authUrl = 'https://login.uber.com/oauth/authorize?' +
                     'response_type=code' +
                     '&client_id=' + clientId;


      this.login = function () {
        var deferred = $q.defer();
        //open IAB window
        var browserWindow = $window.open(authUrl, '_blank', 'location=no');
        // listen for IAB window finish loading
        browserWindow.addEventListener("loadstop", function () {
          //grab linkedin authcode from url response
          getAuthCodeFromResponse(browserWindow)
            .then(function (success) {
              console.log(authCode);
              $http.get(API_HOST + '/api/auth/linkedinAuth?authCode=' + authCode).then(function (success) {
                console.log(success);
                var linkedInUser = success.data;
                userService.create(linkedInUser).then(function (success) {
                  var user = success;
                  deferred.resolve(user);
                }, function (error) {

                })
              }, function (error) {
                console.log(error);
              })
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
        var code = output.url[0].toString(),
          codeRegex = /\?code=(.*)/;
        authCode = code.match(codeRegex)[1];
        console.log('codeeee', authCode);

      }

      function getAuthCodeFromResponse(browserWindow) {
        var deferred = $q.defer();
        // we get the url everythime the page loads
        browserWindow.executeScript({code: "document.URL" },

          //that url is passed to this function
          function (url) {
            var _url = url.toString();

            // we check if the callback page was reached
            if (_url.indexOf("code") > -1 && _url.indexOf('google') > -1 && _url.indexOf('uber') === -1) {
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