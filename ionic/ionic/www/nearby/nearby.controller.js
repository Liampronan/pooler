var ctrlModule = angular.module('pooler.controllers');
ctrlModule
  .controller('NearbyCtrl', ['$scope', '$ionicLoading', '$compile', 'GoogleMapApi'.ns(), '$filter',
    function ($scope, $ionicLoading, $compile, GoogleMapApi, $filter) {


      GoogleMapApi.then(function (maps) {
        console.log('loaded!');
        $scope.map = {
          center: { latitude: 37.796207599999995, longitude: -122.4100767 },
          zoom: 14
        };
      });

      $scope.closeWindow = function(idKey) {
        var marker = findMarkerByIdKey(idKey)
        marker.windowOpts.visible = false;
        $scope.$apply;
      };

      $scope.showWindow = function(idKey){
        if ($scope.activeMarker) $scope.activeMarker.windowOpts.visible = false;
        var marker = findMarkerByIdKey(idKey)
        marker.windowOpts.visible = true;
        $scope.activeMarker = marker;

        $scope.$apply;
      }

      $scope.markers = [
        {
          idKey: 1,
          coords: { latitude: 37.796207599999995, longitude: -122.4100767 },
          windowOpts: {
//            templateUrl: 'gMapWindowProfile.html'
          }
        },
        {
          idKey: 2,
          coords: { latitude: 37.796504, longitude: -122.404091 },
          windowOpts: {
            visible: false
//            templateUrl: 'gMapWindowProfile.html'
          }
        }
      ]

      function findMarkerByIdKey(idKey){
        return $filter('filter')($scope.markers, {idKey: idKey}, true)[0];
      }

    }
  ]);

