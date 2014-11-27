angular.module('pooler')
  .service('messageService', ['$http', '$stateParams', '$q', '$location', '$rootScope', 'API_HOST', 'userService',
    '$ionicPopup', '$state',
    function ($http, $stateParams, $q, $location, $rootScope, API_HOST, userService, $ionicPopup, $state) {
      var data = {
          messages: []
        },
        _this = this,
        currentUser = userService.getUser();

      console.log('msg service curr u', currentUser)
      retrieveUserMessages().then(function (success) {
        data['messages'] = success.data;
        console.log(data['messages']);
      })

      this.create = function(toUberid, fromUberid, message){
        var deferred = $q.defer();

        $http({
          url: API_HOST + '/messages/create',
          method: "POST",
          data: {
            'fromUberid': fromUberid,
            'toUberid': toUberid,
            'message': message
          }
        }).then(function(success){
            data['messages'].push(success.data);
            deferred.resolve(data['messages']);
          }, function(error){
            console.log(error);
          })

        return deferred.promise
      }

      this.getMessagesWith = function(matchUserUberid){
        var userMatchMessages = [];
        console.log('with', data['messages']);
        data['messages'].forEach(function(message){
          if (message.toUberid === matchUserUberid
            || message.fromUberid === matchUserUberid ){
            userMatchMessages.push(message);
          }
        })
        return userMatchMessages;
      }

      this.markMessagesRead = function(matchMessages){
        var readMessages = [];
        matchMessages.forEach(function(message){
          if (!message.readByReceiver && message.fromLinkedInUserId !== currentUser.linkedInUserId ){
            readMessages.push(message['_id']);
            var messageIndex = data['messages'].indexOf(message);
            data['messages'][messageIndex]['readByReceiver'] = true;
          }
        })

        //make backend post only if messages need to be updated
        if (readMessages.length > 0){
          $http({
            url: API_HOST + '/api/message/markRead',
            method: "POST",
            data: {
              'readMessages': readMessages
            }
          }).then(function(messages){

            }, function(error){

            })
        }
      }

//      socket.on('newMessage', function (messageData) {
//        if (messageData.toLinkedInUserId === currentUser.linkedInUserId) {
//          retrieveUserMessages().then(function (success) {
//            data['messages'] = success.data;
//            $rootScope.$broadcast('messages:updated');
//            newMessagePopup()
//          })
//        }
//      });

      // receive notification
      $rootScope.$on('pushNotificationReceived', function(notification, event) {
        messageNotificationHandler(event);
      });

      function messageNotificationHandler(event){
        //get convert "0" to false for iOS
        event.foreground = event.foreground === '0' ? false : event.foreground
        //show new Match Pop if the app is in foreground (otherwise, don't b/c user already saw notification)
        console.log('ev', event);
        if (event.foreground && !$rootScope.matchMessageModelShown && androidOriOSMessage(event) ){
          newMessagePopup();
        } else if (!event.foreground && androidOriOSMessage(event)){
          $state.go('tab.matches');
        }
        if (androidOriOSMessage(event)){
          console.log('getting messages?');
          userService.getUser().then(function (user) {
            currentUser = user;
            console.log('msg service curr u', currentUser)
            retrieveUserMessages().then(function (success) {
              data['messages'] = success.data;
              $rootScope.$broadcast('messages:updated');
            })
          });

        }
      }

      function androidOriOSMessage(event){
        return androidMessage(event) || iOSMessage(event)
      }

      function androidMessage(event){
        return event.payload && event.payload.message.toLowerCase().indexOf('message') > -1
      }

      function iOSMessage(event){
        return event.alert && event.alert.toLowerCase().indexOf('message') > -1
      }

      //alert user of new match
      function newMessagePopup(){
        $ionicPopup.confirm({
          title: '<b>New Message</b>',
          template: '<p class="text-center">You have a new message from one of your matches!</p>',
          buttons: [
            {
              text: 'Close',
              type: 'button-default'
            },
            {
              text: 'View',
              type: 'button-positive',
              onTap: function(e) {
                // e.preventDefault() will stop the popup from closing when tapped.
                $state.go('tab.matches');
              }
            }
          ]
        });
      }


      function retrieveUserMessages(){
        var deferred = $q.defer();

        $http({
          url: API_HOST + '/messages/',
          method: "GET",
          params: {
            'uberid': currentUser.uberid
          }
        }).then(function(messages){
            deferred.resolve(messages);
          }, function(error){
            console.log(error);
          })

        return deferred.promise;
      }
    }
  ]);