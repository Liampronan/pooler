angular
  .module('pooler')
  .directive('message', message);

function message(){
  var directive = {
    link: link,
    templateUrl: 'matches/templates/message.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {
  }
}
