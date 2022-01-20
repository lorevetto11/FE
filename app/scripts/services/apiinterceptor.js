'use strict';

/**
 * @ngdoc function
 * @name APP.services:APIInterceptor
 * @description
 * # APIInterceptor
 * APIInterceptor factory of the APP
 */
angular.module('APP')
.factory('APIInterceptor', function ($rootScope, $q, notify, $translate) {
	return {
		'request': function(config) {
			return config;
		},
		'responseError': function(response) {
			if (response.status === 401) {
				$rootScope.$broadcast('event.unauthorized');
			}
			if (response.status === 403) {
				$rootScope.$broadcast('event.forbidden');
			}
			if (response.status === 404) {
				$rootScope.$broadcast('event.notFound');
			}
            if (response.status === 400 || response.status === 500) {
                var errorCode = "";
                var errorMessage = "";
                if (response.data) {
                    if (response.data && response.data.code) {
                        errorCode = response.data.code;
                    }
                    if (response.data && response.data.message) {
                        errorMessage = response.data.message;
                    }
                }
                //If no data code and no data message take from status and statusText
                if (!errorCode && !errorMessage) {
                    errorCode = response.status + ' - ' + response.statusText;
                    errorMessage = $translate.instant('bad_request_' + response.status);
                }
                notify.logPersistentError(errorCode, errorMessage);
            }
            if (response.status === -1) {
                notify.logPersistentError('NO_CONNECTION', 'Connection lost!');
            }
            return $q.reject(response);
        }
    };
});
