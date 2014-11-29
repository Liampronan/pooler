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

     this.updateMessage = retrieveUserMessages;



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