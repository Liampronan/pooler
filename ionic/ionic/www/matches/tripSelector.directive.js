angular
  .module('pooler')
  .directive('tripSelector', tripSelector);

function tripSelector(){
  var directive = {
    link: link,
    templateUrl: 'matches/templates/tripSelector.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {
  }
}
