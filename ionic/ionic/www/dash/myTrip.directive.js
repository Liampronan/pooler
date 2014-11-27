angular
  .module('pooler')
  .directive('myTrip', myTrip);

function myTrip(){
  var directive = {
    link: link,
    templateUrl: 'dash/templates/myTrip.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {
  }
}
