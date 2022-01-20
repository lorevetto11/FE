'use strict';

/**
 * @ngdoc function
 * @name APP.services:notify
 * @description
 * # APIService
 * Notification factory of the APP
 */
angular.module('APP')
.factory('notify', [
        function() {
            var logIt;
            var logPersistentIt;
            logIt = function(title, message, type) {
                toastr.options = {
                    "closeButton": true,
                    "positionClass": "toast-bottom-right",
                    "timeOut": "3000"
                };
                return toastr[type](message, title);
            };
            logPersistentIt = function(title, message, type) {
                toastr.options = {
                    "closeButton": true,
                    "positionClass": "toast-bottom-full-width",
                    "timeOut": "0",
                    "extendedTimeOut": "0"
                };
                return toastr[type](message, title);
            };
            return {
                log: function(title, message) {
                    logIt(title, message, 'info');
                },
                logWarning: function(title, message) {
                    logIt(title, message, 'warning');
                },
                logSuccess: function(title, message) {
                    logIt(title, message, 'success');
                },
                logError: function(title, message) {
                    logIt(title, message, 'error');
                },
                logPersistentSuccess: function(title, message) {
                  logPersistentIt(title, message, 'success');
                },
                logPersistentError: function(title, message) {
                    logPersistentIt(title, message, 'error');
                }
            };
        }
    ]);
