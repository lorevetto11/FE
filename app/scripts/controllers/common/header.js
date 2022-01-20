'use strict';

/**
 * @ngdoc function
 * @name APP.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the APP
 */
angular.module('APP')
  .controller('HeaderCtrl', function($rootScope, $scope, $translate, $state, $uibModal, $timeout, $window, amMoment, notify, APIService, ResourceService, UtilsService, ENV) {
    var init = function() {

        $scope.Utils = UtilsService;

        $scope.currentUser = ResourceService.getCurrentUser();
        $scope.currentOrganization = ResourceService.getCurrentOrganization();

        $scope.hostEndpoint = ENV.hostEndpoint;

        /*
        if (!$scope.currentUser.role) {
            APIService.getUserRolesByOrganizationId().then(
                function (data) {
                    $scope.currentUser.role = data.find(function (r) {
                        return r.id == $scope.currentUser.roleId;
                    });
                }
            );
        }

        if (ResourceService.getCurrentUserImage()) {
            $scope.currentUserImage = ResourceService.getCurrentUserImage().image;
        }
         */

        $scope.currentLanguage = ResourceService.getCurrentLanguage();
        $scope.applicationInfo = ResourceService.getApplicationInfo();
    };

    $scope.logout = function() {
      APIService.logout().then(function(data) {
        ResourceService.clearContext();
        $state.go('login');
      });
    };

    $scope.lockScreen = function() {
      $state.go('lock-screen');
    };

    $scope.setLang = function(lang) {
      ResourceService.setCurrentLanguage(lang);
    };

    $scope.toggleMenu = function() {
        angular.element('#app').toggleClass('on-canvas');
    };

    $rootScope.$on('resourceChange', function() {
      init();
    });

    init();
  })
;
