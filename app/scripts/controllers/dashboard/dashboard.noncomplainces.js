'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the APP
 */
angular.module('APP')
.controller('DashboardNonCompliancesCtrl', function ($scope, $filter, $log, APIService, Prerequisite) {

    $scope.prerequisites = null;
    $scope.prerequisiteTypes = null;
    $scope.outcomes = null;
    $scope.haccps = null;
    $scope.noncompliances = null;
    $scope.monitorings = null;
    $scope.analysisParameters = null;
    $scope.analysisParameterValues = null;

    $scope.loader = false;

    $scope.noncomplianceChartOptions = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: '' //'NON-COMPLIANCES distribution'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b> <small>({point.percentage:.1f}%)</small>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: <b>{point.y}</b> <small>({point.percentage:.1f} %)</small>',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: []
        }]
    };

    $scope.gt = function(prop, val){
        return function(item){
            return item[prop] > val;
        }
    };

    function init() {

        $log.info("DashboardNonCompliancesCtrl", $scope.organization);


        $scope.prerequisiteTypes = [];
        $scope.haccps = [];


        $scope.loader = true;


        APIService.getNoncompliancesByOrganizationId($scope.organization.id).then(
            function(data){
                $scope.noncompliances = data;


                Prerequisite.TYPES.forEach(function(type) {
                    if( !Prerequisite.isCCP( { type : type })) {


                        $log.info("type:", type);
                        var pre = {
                            name : type,
                            ncCount : $scope.noncompliances.filter(function(item){
                                return item.organization.id == $scope.organization.id &&  item.context && item.context.className.indexOf(type) == 0 && item.closeDate == null;
                            }).length,
                        };

                        if(pre.ncCount > 0) {
                            $scope.noncomplianceChartOptions.series[0].data.push({
                                name: pre.name,
                                y: pre.ncCount
                            })
                        }

                        $scope.prerequisiteTypes.push(pre);
                    };
                });

                $scope.loader = false;

                APIService.getDangersByOrganizationId($scope.organization.id).then(
                    function(data) {

                        if(data) {
                            data.forEach(function(danger) {

                                var ccp = {
                                    name : danger.name,
                                    ncCount : $scope.noncompliances.filter(function(item){
                                        return item.prerequisiteType == Prerequisite.DANGER &&
                                            item.prerequisiteId == danger.id &&
                                            item.closeDate == null;
                                    }).length
                                };

                                if(ccp.ncCount > 0) {
                                    $scope.noncomplianceChartOptions.series[0].data.push({
                                        name: ccp.name,
                                        y: ccp.ncCount
                                    })
                                }


                                $scope.haccps.push(ccp);
                            });


                        }

                    });
            });
    };


    function init_() {


       var organizationId = $scope.organization ? $scope.organization.id : null;

        $scope.prerequisiteTypes = [];
        $scope.haccps = [];


        $scope.loader = true;





        APIService.getNoncompliancesByOrganizationId().then(
            function(data){
                $scope.noncompliances = data;


                Prerequisite.TYPES.forEach(function(type) {
                    if( !Prerequisite.isCCP( { type : type })) {

                        var pre = {
                            name : type,
                            ncCount : $scope.noncompliances.filter(function(item){
                                return item.prerequisiteType == type && item.closeDate == null;
                            }).length,
                        };

                        if(pre.ncCount > 0) {
                            $scope.noncomplianceChartOptions.series[0].data.push({
                                name: pre.name,
                                y: pre.ncCount
                            })
                        }

                        $scope.prerequisiteTypes.push(pre);
                    };
                });



                APIService.getDangersByOrganizationId().then(
                    function(data) {

                        if(data) {
                            data.forEach(function(danger) {

                                var ccp = {
                                    name : danger.name,
                                    ncCount : $scope.noncompliances.filter(function(item){
                                        return item.prerequisiteType == Prerequisite.DANGER &&
                                            item.prerequisiteId == danger.id &&
                                            item.closeDate == null;
                                    }).length
                                };

                                if(ccp.ncCount > 0) {
                                    $scope.noncomplianceChartOptions.series[0].data.push({
                                        name: ccp.name,
                                        y: ccp.ncCount
                                    })
                                }

                                $scope.haccps.push(ccp);
                            });
                        }

                        $scope.loader = false;
                    });
            });
    };

    init();

});
