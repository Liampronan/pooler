angular.module('push', [])
  .factory('pushConfigService', ['localStorageService', '$rootScope', 'userService',
    function (localStorageService, $rootScope, userService) {
      var obj = {};

//      // receive notification
      $rootScope.$on('pushNotificationReceived', function(notification, event) {
        console.log('eventtt', event);
        if (event.event === 'registered' && event.regid){
          userService.setACMRegid(event.regid);
        }
      })
//        // process notification
//        console.log(notification);
//        console.log(event);
//        if (event.event === 'registered'){
//          userService.setACMRegid(event.regid);
//        } else if (event.event === 'message'){
//          if (event.foreground) {
////              var my_media = new Media("/android_asset/www/" + event.soundname);
////              my_media.play();
//
//            } else {
//              if (event.coldstart) {
//              } else {
//              }
//            }
//        }
//      });

      obj.androidConfig =  {
        "senderID": "305658173639"//,
//        "ecb": "notificationHandler"
      };

      obj.iosConfig =  {
        "badge":"true",
        "sound":"false",
        "alert":"true"
      };

//    TODO: figure out how to ref this correctly in androidCofig 'ecb'
//      obj.notificationHandler = function(event) {
//        switch (event.event) {
//          case 'registered':
//            if (event.regid.length > 0) {
//              console.log('regid!!', event.regid);
//              return fn({
//                'type': 'registration',
//                'id': event.regid,
//                'device': 'android'
//              });
//            }
//            break;
//
//          case 'message':
//            if (event.foreground) {
//              var my_media = new Media("/android_asset/www/" + event.soundname);
//              my_media.play();
//            } else {
//              if (event.coldstart) {
//              } else {
//              }
//            }
//            break;
//
//          case 'error':
//            break;
//
//          default:
//            break;
//        };
//      }

      return obj

    }]);

//
//      $cordovaPush.unregister(options).then(function(result) {
//        // Success!
//      }, function(err) {
//        // An error occured. Show a message to the user
//      });


// (optional) custom notification handler
// If you set "ecb" in the config object, the 'pushNotificationReceived' angular event will not be broadcast.
// You will be responsible for handling the notification and passing it to your contollers/services
//        androidConfig.ecb = "notificationHandler"
//        iosConfig.ecb = "myCustomOnNotificationAPNHandler"



//        $ionicPlatform.ready(function() {
//          $cordovaPush.register(androidConfig).then(function(result) {
//            // Success!
//          }, function(err) {
//            // An error occured. Show a message to the user
//          });
//
//          $cordovaPush.unregister(options).then(function(result) {
//            // Success!
//          }, function(err) {
//            // An error occured. Show a message to the user
//          });
//        });



//        // iOS only
//        $cordovaPush.setBadgeNumber(2).then(function(result) {
//          // Success!
//        }, function(err) {
//          // An error occured. Show a message to the user
//        });
