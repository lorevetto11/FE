'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
  .controller('OrganizationAreaListItemCtrl', function ($scope, $state, $translate, $q, ModalService, APIService, PermissionService, ResourceService, StorageService, UtilsService, ENV) {


    $scope.remove = function(area)
    {
      $scope.onRemove({"item" : area });
    };

    $scope.addTo = function(area)
    {
        if(area)
        {
           if(area.areas == null)
              area.areas = [];

            area.areas.push({
              name: '',
              organizationId : area.organizationId,
              parentAreaId : area.id
            });
        }
    };

  });
