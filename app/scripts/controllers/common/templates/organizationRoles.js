'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
  .controller('OrganizationRolesCtrl', function ($scope, $state, $translate, $q, ModalService, APIService, PermissionService, ResourceService, StorageService, UtilsService, ENV) {

    $scope.roles = null;
    $scope.originalRoles = null;
    $scope.roleTemplates = null;
    $scope.selected = {
      template : null
    };

    var toBeDeleted = [];
    var toBeUpdated = [];
    var toBeCreated = [];

    $scope.remove = function(item, list) {

      var idx = list.indexOf(item);

      if(idx != -1)
        list.splice(idx,1);
    };

    $scope.add = function(){

      if($scope.roles == null)
            $scope.roles = [];

      $scope.roles.push({
          name: '',
          organizationId : $scope.organizationId
      });
    };
/*
    $scope.applyTemplate = function()
    {
      if($scope.selected.template != null)
      {
        ModalService.dialogConfirm("org-roles-apply-tpl-dialog-title",
            "org-roles-apply-tpl-dialog-message", function(success, error) {

              APIService.organizationAreaApplyTemplate($scope.organizationId, $scope.selected.template.templateId).then(
                  function successCallback() {

                    success()

                    ModalService.dialogSuccess("org-roles-apply-tpl-dialog-success", function(){
                      init();
                    });
              });
        });
      }
    };
    */

    $scope.save = function()
    {
      if (!angular.equals($scope.originalAreas, UtilsService.clearObjectField(
              $scope.organizationAreas,'$$hashKey')))
      {
          console.log("isDifferent");

          toBeDeleted = [];
          toBeUpdated = [];
          toBeCreated = [];

          // check to be delete
          checkDeleted();
          // check to be created
          checkCreated();
          // check to be updated
          checkUpdated();

          ModalService.dialogConfirm("org-area-update-dialog-title",
              "org-area-update-dialog-message", function(success, error) {

                  recursiveAreaDelete(toBeDeleted, function(){
                    recursiveAreaCreate(toBeCreated, function(){
                      recursiveAreaUpdate(toBeUpdated, function(){

                        success()

                        ModalService.dialogSuccess("org-area-update-dialog-success", function(){
                          init();
                        });
                      });
                    });
                  });
          });


          function recursiveAreaDelete(items, callback) {

              if(items == null || items.length == 0)
                  return callback();

              APIService.deleteOrganizationArea(items.shift()).then(
                  function successCallback() {
                      return recursiveAreaDelete(items, callback);
                  });
          }

          function recursiveAreaCreate(items, callback) {

              if(items == null || items.length == 0)
                  return callback();

              APIService.createOrganizationArea(items.shift()).then(
                  function successCallback() {
                      return recursiveAreaCreate(items, callback);
                  });
          }

          function recursiveAreaUpdate(items, callback) {

              if(items == null || items.length == 0)
                  return callback();

              APIService.updateOrganizationArea(items.shift()).then(
                  function successCallback() {
                      return recursiveAreaUpdate(items, callback);
                  });
          }


      }
    };

    function checkDeleted()
    {
      var mapById = {};
      toBeDeleted = [];

      buildMapById($scope.organizationAreas, mapById);
      recursiveCheckDeleted($scope.originalAreas);

    //  console.log("mapById:", mapById);
      console.log("toBeDeleted:", toBeDeleted);

      function recursiveCheckDeleted(areas)
      {
        if(typeof areas == 'object' && typeof areas.length == 'number')
        {
          for(var i = 0, len = areas.length; i < len; ++i)
          {
              if(mapById[areas[i].id] == null)
                toBeDeleted.push(areas[i]);

            if(areas[i].areas != null)
              recursiveCheckDeleted(areas[i].areas);
          }
        }
      }
    }

    function checkCreated()
    {
      toBeCreated = [];
      recursiveCheckCreated($scope.organizationAreas, null);

      console.log("toBeCreated:", toBeCreated);

      function recursiveCheckCreated(areas, parentId)
      {
        if(typeof areas == 'object' && typeof areas.length == 'number')
        {
          for(var i = 0, len = areas.length; i < len; ++i)
          {
              if(areas[i].id == null)
                toBeCreated.push(areas[i]);

            if(areas[i].areas != null)
              recursiveCheckCreated(areas[i].areas, areas[i].id);
          }
        }
      }
    };

    function checkUpdated()
    {
      var mapById = {};
      toBeUpdated = [];

      buildMapById($scope.originalAreas, mapById);
      recursiveCheckUpdated($scope.organizationAreas);

      console.log("toBeUpdated:", toBeUpdated);

      function recursiveCheckUpdated(areas)
      {
        if(typeof areas == 'object' && typeof areas.length == 'number')
        {
          for(var i = 0, len = areas.length; i < len; ++i)
          {
              var original = mapById[areas[i].id];
              if(original != null && original.name != areas[i].name)
                toBeUpdated.push(areas[i]);

            if(areas[i].areas != null)
              recursiveCheckUpdated(areas[i].areas);
          }
        }
      }
    };


    function buildMapById(areas, map)
    {
      if(typeof areas == 'object' && typeof areas.length == 'number')
      {
        for(var i = 0, len = areas.length; i < len; ++i)
        {
          map[areas[i].id] = areas[i];

          if(areas[i].areas != null)
            buildMapById(areas[i].areas, map);
        }
      }
    };




    function loadData(organizationId)
    {
      APIService.getOrganizationArea(organizationId).then(
          function successCallback(data) {
              $scope.originalAreas = angular.copy(data);
              $scope.organizationAreas = angular.copy(data);
      });
    };

    function loadTemplates()
    {
      APIService.getOrganizationAreaTemplates().then(
          function successCallback(data) {
              $scope.organizationAreaTemplates = data;
      });

    };

    function init()
    {
        loadData($scope.organizationId);
        loadTemplates();
    };

    init();

  });
