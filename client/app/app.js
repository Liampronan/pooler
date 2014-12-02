'use strict';

angular.module('pooler', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('/', {
          url: "/",
          templateUrl: 'app/home/hello.html',
          controller: 'HelloCtrl'
        })
      .state('/spread_the_awesomeness', {
          url: '/spread_the_awesomeness',
          templateUrl: 'app/referral/referral.html',
          controller: 'ReferralCtrl'
      })

    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(false);
  });