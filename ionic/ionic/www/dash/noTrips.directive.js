angular
  .module('pooler')
  .directive('noTrips', noTrips);

function noTrips(){
  var directive = {
    link: link,
    templateUrl: 'dash/templates/noTrips.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {
  }
}
