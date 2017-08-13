angular.module('iotgo')

.factory('Settings', [ '$location', function ($location) {
  var host = $location.host() + ':' + $location.port();

  return {
    httpServer: 'http://' + host,
    websocketServer: 'ws://' + $location.host() + ':8888'
  };
} ]);