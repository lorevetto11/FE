'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
  .controller('OrganizationAreasCtrl', function ($scope, $state, $translate, $q, ModalService, APIService, PermissionService, ResourceService, StorageService, UtilsService, ENV) {

    $scope.organizationAreas = null;
    $scope.originalAreas = null;
    $scope.organizationAreaTemplates = null;
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

      if($scope.organizationAreas == null)
            $scope.organizationAreas = [];

      $scope.organizationAreas.push({
          name: '',
          organizationId : $scope.organizationId
      });
    };

    $scope.applyTemplate = function()
    {
      if($scope.selected.template != null)
      {
        ModalService.dialogConfirm("org-area-apply-tpl-dialog-title",
            "org-area-apply-tpl-dialog-message", function(success, error) {

              APIService.organizationAreaApplyTemplate($scope.organizationId, $scope.selected.template.templateId).then(
                  function successCallback() {

                    success()

                    ModalService.dialogSuccess("org-area-apply-tpl-dialog-success", function(){
                      init();
                    });
              });
        });
      }
    };

    $scope.save = function()
    {
      console.log("SAVE");

      if (!angular.equals($scope.originalAreas, UtilsService.clearObjectField(
              $scope.organizationAreas,'$$hashKey')))
      {
          console.log("isDifferent");

          toBeDeleted = [];
          toBeUpdated = [];
          toBeCreated = [];

      //    console.log("mapById: ", mapById);

          // check to be delete

          checkDeleted();
          //recursiveCheckDeleted($scope.originalAreas);
          checkCreated();
          // check to be updated
          checkUpdated();
          // check to be created

          ModalService.dialogConfirm("org-area-update-dialog-title",
              "org-area-update-dialog-message", function(success, error) {

                  recursiveAreaDelete(toBeDeleted, function(){
                    createAreas(toBeCreated, null, function(){
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

          function createAreas(items, parentId, callback) {
              
              if(items == null || items.length == 0)
                  return callback();

              var totalCalls = getTotalCalls(items);
              var successCalls = 0;
              recursiveAreaCreate(items, parentId, function(){
                  if (++successCalls == totalCalls)
                       return callback();
              });
          }
          
          function getTotalCalls(items) {
              var calls = 0;
              items.forEach(function(item) {
                ++calls;
                if(item.areas != null) {
                  calls += getTotalCalls(item.areas);
                  }
              });
              return calls;
          }

          function recursiveAreaCreate(items, parentId, callback) {

              items.forEach(function(item) {
                    if(item.id == null) {
                      if (parentId != null && item.parentAreaId == null)
                          item.parentAreaId = parentId;

                        var myItem = {
                            "id" : item.id,
                            "name" : item.name,
                            "parentAreaId" : item.parentAreaId,
                            "organizationId" : item.organizationId
                        };

                        APIService.createOrganizationArea(myItem).then(
                            function successCallback(data) {
                                callback();
                                var returnItem = data;
                                if(item.areas != null && typeof returnItem.id == 'number') {
                                  return recursiveAreaCreate(item.areas, returnItem.id, callback);
                                  }
                            });
                    };
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
              if(areas[i].id == null) {
                toBeCreated.push(areas[i]);
              } else {
                if(areas[i].areas != null)
                  recursiveCheckCreated(areas[i].areas, areas[i].id);
              }
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
              {
                  toBeUpdated.push({
                    id: areas[i].id,
                    name: areas[i].name,
                    prentAreaId : areas[i].prentAreaId,
                    organizationId : areas[i].organizationId
                  });
              }

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
