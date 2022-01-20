
angular.module('APP')
.directive('auth', [
    function () {
        return {
            restrict: 'A',
            link: function ($scope, element, attrs) {

                element.hide();

                $scope.checkAuthorization(attrs.auth).then(
                    function successCallback(data) {
                        if (!data) {
                            element.unbind('click');
                        } else {
                            element.show();
                        }
                    });
            },
            controller: function ($scope, $q, $log, PermissionService) {
                $scope.checkAuthorization = function(auth) {
                    return $q(function (resolve, reject) {
                        PermissionService.isUserAuthorized(auth).then(
                            function successCallback(data) {
                                $log.info("isUserAuthorized: " + auth, data);
                                resolve(data);
                            });
                    });
                }
            }
        };
    }
])
.directive('unAuth', [
    function () {
        return {
            restrict: 'A',
            link: function ($scope, element, attrs) {

                $scope.checkAuthorization(attrs.unAuth).then(
                    function successCallback(data) {
                        if (data) {
                            element.hide();
                            element.unbind('click');
                        }
                    });
            },
            controller: function ($scope, $q, PermissionService) {
                $scope.checkAuthorization = function(auth) {
                    return $q(function (resolve, reject) {
                        PermissionService.isUserAuthorized(auth).then(
                            function successCallback(data) {
                                resolve(data);
                            });
                    });
                }
            }
        };
    }
]);

