//overwrite ngCordova-included pushplugin due to updated methods (included plugin is rewritten during build -
// TODO: update plugin in ng-cordova instead of overwriting..)
angular.module('ngCordova.plugins.push', [])

  .factory('$cordovaPush', ['$q', '$window', '$rootScope', function ($q, $window, $rootScope) {
    return {
      onNotification: function(notification) {
        $rootScope.$broadcast('pushNotificationReceived', notification);
      },

      register: function (config) {
        var q = $q.defer();

        if (config !== undefined && config.ecb === undefined) {
          config.ecb = "angular.element(document.querySelector('[ng-app]')).injector().get('$cordovaPush').onNotification";
        }

        $window.plugins.pushNotification.register(
          function (result) {
            q.resolve(result);
          },
          function (error) {
            q.reject(error);
          },
          config);

        return q.promise;
      },

      unregister: function (options) {
        var q = $q.defer();
        $window.plugins.pushNotification.unregister(
          function (result) {
            q.resolve(result);
          },
          function (error) {
            q.reject(error);
          },
          options);

        return q.promise;
      },

      // iOS only
      setBadgeNumber: function (number) {
        var q = $q.defer();
        $window.plugins.pushNotification.setApplicationIconBadgeNumber(
          function (result) {
            q.resolve(result);
          },
          function (error) {
            q.reject(error);
          },
          number);
        return q.promise;
      }
    };
  }]);