'use strict';

/**
 * @ngdoc function
 * @name APP.services:StorageService
 * @description
 * # StorageService
 * Service for interacting with storage (local, session, etc...) of the APP
 */
angular.module('APP')
.factory('StorageService', function ($resource, $rootScope, $q, $cookies, localStorageService) {

  //INTERNAL METHODS
  var _clearAll = function() {
    return localStorageService.clearAll();
  }

  var _getLocalStorage = function (key) {
    return localStorageService.get(key);
  };
  var _putLocalStorage = function (key,value) {
    localStorageService.set(key, value);
  };
  var _getCookieStorage = function (key) {
    return $cookies.getObject(key);
  };
  var _putCookieStorage = function (key,value) {
    $cookies.putObject(key, value);
  };

  //EXTERNAL METHODS
  return {
    clearAll: function() {
      return _clearAll()
    },
    getLocalStorage: function (key) {
      //TODO:decrypt?
      return _getLocalStorage(key);
    },
    putLocalStorage: function (key, value) {
      //TODO:crypt?
      return _putLocalStorage(key, value);
    },
    getCookieStorage: function (key) {
      return _getCookieStorage(key);
    },
    putCookieStorage: function (key, value) {
      return _putCookieStorage(key, value);
    }
  };
});
