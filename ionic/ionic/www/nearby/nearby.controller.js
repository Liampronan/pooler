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
        var marker = findMarkerByIdKey(idKey);
        marker.windowOpts.visible = false;
        $scope.showPolyline = false;
//        $scope.$apply;
      };

      $scope.showWindow = function(idKey){
        if ($scope.activeMarker) $scope.activeMarker.windowOpts.visible = false;
        var marker = findMarkerByIdKey(idKey);
        marker.windowOpts.visible = true;
        $scope.activeMarker = marker;
        setPolyline();
        $scope.showPolyline = true;
//        $scope.$apply;
      }

      $scope.markers = [
        {
          idKey: 1,
          departCoords: { latitude: 37.796207599999995, longitude: -122.4100767 },
          arrivalCoords: { latitude: 37.7736679, longitude: -122.4024041 },
          windowOpts: {
            visible: false
          }
        },
        {
          idKey: 2,
          departCoords: { latitude: 37.796504, longitude: -122.404091 },
          arrivalCoords: { latitude: 37.797625, longitude: -122.430039 },
          windowOpts: {
            visible: false
          }
        }
      ]

      function findMarkerByIdKey(idKey){
        return $filter('filter')($scope.markers, {idKey: idKey}, true)[0];
      }

      function setPolyline(){
        $scope.polyline = {
          path: [
                $scope.activeMarker.departCoords,
                $scope.activeMarker.arrivalCoords
                ]
        }
        console.log($scope.polyline);
      }

    }
  ]);

