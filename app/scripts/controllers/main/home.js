'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
  .controller('MainHomeCtrl', function ($scope, $state, $translate, $q, currentUser, APIService, ResourceService, StorageService, UtilsService, ENV) {
    $scope.Utils = UtilsService;
    $scope.currentUser = currentUser;
    $scope.encounters = {};
    $scope.sexArray = ['M','F'];
    $scope.chartData = {};
    $scope.showChart = false;
    $scope.chart = {
      options: {
        series: {
            pie: {
                show: true,
                innerRadius: 0.45
            }
        },
        legend: {
            show: false
        },
        grid: {
            hoverable: true,
            clickable: true
        },
        colors: ["#176799", "#78D6C7", "#42A4BB", "#5BC0C4", "#78D6C7"],
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s",
            defaultTheme: false
        }
      }
    };

   // $scope.currentServicePoints = ResourceService.getCurrentServicePoints();

    $scope.getServicePointEncounters = function (_servicePoint) {
      APIService.getOpenEncountersByServicePoint(_servicePoint).then(
        function successCallback(data) {
          $scope.encounters[_servicePoint.code] = data;

          var chartDataItem;
          if (!$scope.chartData[_servicePoint.code]) {
            $scope.chartData[_servicePoint.code] = { data:[{label:'M',data:0},{label:'F',data:0}] };
          }

          for (var i=0; i<data.length; i++) {
            if (data[i].patient) {
              chartDataItem = $scope.chartData[_servicePoint.code];
              chartDataItem.data[$scope.sexArray.indexOf(data[i].patient.sex)].data++;
            }
          }
          if (chartDataItem) {
            chartDataItem.show = true;
          }
        });
    }

    $scope.selectEncounter = function(_encounter) {
      ResourceService.setSelectedPatient(_encounter.patient);
      ResourceService.setSelectedEncounter(_encounter);
      $state.go('patient.encounter',{encounterId: _encounter.id});
    };
  });
