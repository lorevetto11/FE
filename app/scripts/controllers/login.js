'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the APP
 */
angular.module('APP')
.controller('LoginCtrl', function ($scope, $rootScope, $translate, $state, $compile, $log, $filter, $timeout, md5,
                                   notify, APIService, ENV, ResourceService, PermissionService, StorageService) {
    $scope.username = "";
    $scope.password = "";

    $scope.loader = false;

    $scope.invalidLogin = false;

    /*
     APIService.getApplicationInfo().then(
     function successCallback(data) {
     ResourceService.setApplicationInfo(data);
     $scope.applicationInfo = data;
     });
     */

    /*
     $scope.changeLanguage = function (langKey) {
     $translate.use(langKey).then(function (data) {
     $scope.lang = langKey;
     $state.go($state.current.name, null, {reload: true});
     });
     };
     */
    
    function loginError(response) {

        if(response) {
            if(response.status == 405 || response.status == 401) {
                //$scope.invalidLogin = true;
                notify.logError('Errore', 'Username o password non validi');
            }}

        $scope.loader = false;
    };

    $scope.submit = function () {
        $scope.showErrorMessage = false;
        $scope.showSuccessMessage = true;
        $scope.invalidLogin = false;
        $scope.username = $scope.username.toLowerCase();

        $scope.loader = true;

        //TODO: check form validation

        ResourceService.clearAll();

        APIService.login($scope.username, $scope.password).then(
            function success(user) {
                $log.info('submit success:', user);


                ResourceService.setCurrentUser(user);
                ResourceService.setCurrentOrganization(user.organization);
                ResourceService.setCurrentLanguage(user.language);

                ResourceService.setSelectedOrganization(user.organization);


                PermissionService.loadGrants().then(function(grants){
                    $log.info('GRANTS:', grants);
                    $state.go('organization');

                    // apsetta di completare la redirezione prima di togliere il loader
                    $timeout(function(){$scope.loader = false;}, 500);
                }, loginError );
            }, loginError );
    };
});
