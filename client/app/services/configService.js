angular.module('pooler')
  .service("config", function() {

    //set server config based on environment
    if (window.location.host.match(/127.0.0.1/) !== null) {
      this.host = 'http://localhost:9000';
    } else {
      this.host = 'http://23.253.95.97';
    }
  });