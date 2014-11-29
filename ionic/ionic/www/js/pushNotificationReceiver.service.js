angular.module('pooler')
  .service('pushNotificationReceiverService', ['$http', '$stateParams', '$q', '$location', '$rootScope', 'API_HOST', 'localStorageService',
    '$ionicPopup', '$state', 'userService', 'messageService',
    function ($http, $stateParams, $q, $location, $rootScope, API_HOST, localStorageService, $ionicPopup, $state,
              userService, messageService) {
      var data = {
          user: {
          }
        },
        _this = this;


      // receive notification
      $rootScope.$on('pushNotificationReceived', function(notification, event) {
        userNotificationHandler(event);
      });

      function userNotificationHandler(event){
        //get convert "0" to false for iOS
        event.foreground = event.foreground === '0' ? false : event.foreground;

        if (androidOriOSMatch(event)){
          userService.setUser(false, true).then(function(){
            $rootScope.$broadcast('matches:updated');
          })
        } else if (androidOriOSTripRequest(event)){
          userService.setUser(false, true).then(function(){
            $rootScope.$broadcast('matches:updated');
          })
        } else if (androidOriOSRequestAccepted(event)){
          userService.setUser(false, true).then(function(){
            $rootScope.$broadcast('matches:updated');
          })
        } else if (androidOriOSNewMessage(event)){
          messageService.updateMessages().then(function(){
            $rootScope.$broadcast('messages:updated');
          })
        }

        //show new Match Popup if the app is in foreground (otherwise, don't b/c user already saw notification)
        if (event.foreground && androidOriOSMatch(event)){
          newMatchPopup();
        } else if (!event.foreground && androidOriOSMatch(event)){
          $state.go('tab.matches');
        } else if (event.foreground && androidOriOSTripRequest(event)){
          newRequestPopup();
        } else if (!event.foreground && androidOriOSTripRequest(event)){
          $state.go('tab.matches');
        } else if (event.foreground && androidOriOSRequestAccepted(event)){
          requestAcceptedPopup();
        } else if (!event.foreground && androidOriOSRequestAccepted(event)){
          $state.go('tab.matches');
        } else if (event.foreground && androidOriOSNewMessage(event)){
          newMessagePopup();
        } else if (!event.foreground && androidOriOSNewMessage(event)){
          $state.go('tab.matches');
        }
      }

      function androidOriOSMatch(event){
        return androidMatch(event) || iOSMatch(event)
      }

      function androidMatch(event){
        return event.payload && event.payload.message.toLowerCase().indexOf('match ') > -1
      }

      function iOSMatch(event){
        return event.alert && event.alert.toLowerCase().indexOf('match ') > -1
      }

      //alert user of new match
      function newMatchPopup(){
        $ionicPopup.confirm({
          title: '<b>New Match</b>',
          template: '<p class="text-center">Another rider\'s trip matches one of yours</p>',
          buttons: [
            {
              text: 'Close',
              type: 'button-default'
            },
            {
              text: 'View Match',
              type: 'button-energized',
              onTap: function(e) {
                // e.preventDefault() will stop the popup from closing when tapped.
                $state.go('tab.matches');
              }
            }
          ]
        });
      }

      function androidOriOSTripRequest(event){
        return androidTripRequest(event) || iOSTripRequest(event)
      }

      function androidTripRequest(event){
        return event.payload && event.payload.message.toLowerCase().indexOf('new trip request') > -1
      }

      function iOSTripRequest(event){
        return event.alert && event.alert.toLowerCase().indexOf('new trip request') > -1
      }

      //alert user of new request
      function newRequestPopup(){
        $ionicPopup.confirm({
          title: '<b>New Request</b>',
          template: '<p class="text-center">Another rider requested to join one of your trips</p>',
          buttons: [
            {
              text: 'Close',
              type: 'button-default'
            },
            {
              text: 'View Request',
              type: 'button-energized',
              onTap: function(e) {
                // e.preventDefault() will stop the popup from closing when tapped.
                $state.go('tab.matches');
              }
            }
          ]
        });
      }

      function androidOriOSRequestAccepted(event){
        return androidRequestAccepted(event) || iOSRequestAccepted(event)
      }

      function androidRequestAccepted(event){
        return event.payload && event.payload.message.toLowerCase().indexOf('one of your matches accepted your trip request') > -1
      }

      function iOSRequestAccepted(event){
        return event.alert && event.alert.toLowerCase().indexOf('one of your matches accepted your trip request') > -1
      }

      //alert user of new request
      function requestAcceptedPopup(){
        $ionicPopup.confirm({
          title: '<b>Trip Request Accepted</b>',
          template: '<p class="text-center">Another ride accepted your trip request</p>',
          buttons: [
            {
              text: 'Close',
              type: 'button-default'
            },
            {
              text: 'View Trip',
              type: 'button-energized',
              onTap: function(e) {
                // e.preventDefault() will stop the popup from closing when tapped.
                $state.go('tab.matches');
              }
            }
          ]
        });
      }
      function androidOriOSNewMessage(event){
        return androidNewMessage(event) || iOSNewMessage(event)
      }

      function androidNewMessage(event){
        return event.payload && event.payload.message.toLowerCase().indexOf('message from a matched rider') > -1
      }

      function iOSNewMessage(event){
        return event.alert && event.alert.toLowerCase().indexOf('message from a matched rider') > -1
      }

      //alert user of new request
      function newMessagePopup(){
        $ionicPopup.confirm({
          title: '<b>New Message</b>',
          template: '<p class="text-center">New Message from a matched rider</p>',
          buttons: [
            {
              text: 'Close',
              type: 'button-default'
            },
            {
              text: 'View Trip',
              type: 'button-energized',
              onTap: function(e) {
                // e.preventDefault() will stop the popup from closing when tapped.
                $state.go('tab.matches');
              }
            }
          ]
        });
      }

    }
  ]);

