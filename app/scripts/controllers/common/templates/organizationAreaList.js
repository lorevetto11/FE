'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
  .controller('OrganizationAreaListCtrl', function ($scope, $state, $translate, $q, ModalService, APIService, PermissionService, ResourceService, StorageService, UtilsService, ENV) {

  //  $scope.areas = null;



  $scope.onRemoveCallback = function(area) {
    console.log("OrganizationAreaListCtrl onRemoveCallback:", area);


  };


  });
