// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('pooler', ['ionic', 'pooler.controllers', 'pooler.services', 'google-maps'.ns(), 'LocalStorageModule',
    'ion-google-place', 'angularMoment', 'ngCordova', 'pascalprecht.translate', 'push'])

.constant('API_HOST', 'https://liampronan.com/api')

.run(function($ionicPlatform, $cordovaPush, $cordovaDevice, pushConfigService, pushNotificationReceiverService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    var platform = $cordovaDevice.getPlatform();
    console.log('device', platform);
    //pushplugin
    if (platform === 'iOS'){
      console.log('helloo you will get this..');
      $cordovaPush.register(pushConfigService.iosConfig).then(function(result) {
        console.log('¡iOS', result);
        userService.setAPNRegid(result);
      }, function(err) {
        console.log(':<', err);
        // An error occured. Show a message to the user
      });
    } else if (platform === 'Android'){
      $cordovaPush.register(pushConfigService.androidConfig).then(function(result) {
        console.log('¡', result);
      }, function(err) {
        console.log(':<', err);
        // An error occured. Show a message to the user
      });
    }


  });
})

.config(['$stateProvider', '$urlRouterProvider', 'GoogleMapApiProvider'.ns(), '$ionicTabsConfig',
  function($stateProvider, $urlRouterProvider, GoogleMapApi, $ionicTabsConfig) {

  $stateProvider
    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'dash/templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.dash-home-logged-in', {
      url: '/dashHomeLoggedIn',
      views: {
        'tab-dash': {
          templateUrl: 'dash/templates/dashHomeLoggedIn.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.dash-edit-trip', {
      url: '/dashEditTrip?tripIndex',
      views: {
        'tab-dash': {
          templateUrl: 'dash/templates/editTrip.html',
          controller: 'DashTripCtrl'
        }
      }
    })

    .state('tab.nearby', {
      url: '/nearby',
      views: {
        'tab-nearby': {
          templateUrl: 'nearby/templates/tab-nearby.html',
          controller: 'NearbyCtrl'
        }
      }
    })

    .state('tab.matches', {
      url: '/matches?tripIndex',
      views: {
        'tab-matches': {
          templateUrl: 'matches/templates/tab-matches.html',
          controller: 'MatchesCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

  GoogleMapApi.configure({
    //    key: 'your api key',
    v: '3.17',
    libraries: 'weather,geometry,visualization'
  });
  // Override the Android platform default to add "tabs-striped" class to "ion-tabs" elements.
  $ionicTabsConfig.type = '';



  }]);

