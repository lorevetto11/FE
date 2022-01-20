'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the APP
 */
angular.module('APP')
.controller('DashboardCtrl', function ($scope, $filter, $log, APIService, Prerequisite, ResourceService) {

    $scope.prerequisites = null;
    $scope.prerequisiteTypes = null;
    $scope.outcomes = null;
    $scope.haccps = null;
    $scope.noncompliances = null;
    $scope.monitorings = null;
    $scope.analysisParameters = null;
    $scope.analysisParameterValues = null;

    $scope.organizations = null;

    $scope.selectedOrganization = ResourceService.getSelectedOrganization();
    $scope.$on('resourceChange', function () {

        var value = ResourceService.getSelectedOrganization();
        if ($scope.selectedOrganization != value) {
            $scope.selectedOrganization = value;

            if(value) {
                init();
            }
        }
    });

/*
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
    */

    $scope.monitoringsChartOptions = {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: []
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total monitorings'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
            shared: true
        },
        plotOptions: {
            column: {
                stacking: 'percent'
            }
        },
        series: [{
            name: 'Positive',
            data: []
        }, {
            name: 'Negative',
            data: []
        }]
    };


    $scope.dataAnalysisChartOptions = {
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Value'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            categories: []
        },
        yAxis: {
            title: {
                text: 'Date'
            }
        },
        legend_: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: -100,
            y: 0,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            scatter: {
                marker: {
                    symbol : 'circle',
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x}'
                }
            }
        },
        series: [{
            name: 'Female',
            color: 'rgba(223, 83, 83, .5)',
            data: [ '', 161.2, 167.5],
            data_ : [[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
                [170.0, 59.0], [159.1, 47.6], [166.0, 69.8], [176.2, 66.8], [160.2, 75.2],
                [172.5, 55.2], [170.9, 54.2], [172.9, 62.5], [153.4, 42.0], [160.0, 50.0],
                [147.2, 49.8], [168.2, 49.2], [175.0, 73.2], [157.0, 47.8], [167.6, 68.8],
                [159.5, 50.6], [175.0, 82.5], [166.8, 57.2], [176.5, 87.8], [170.2, 72.8],
                [174.0, 54.5], [173.0, 59.8], [179.9, 67.3], [170.5, 67.8], [160.0, 47.0],
                [154.4, 46.2], [162.0, 55.0], [176.5, 83.0], [160.0, 54.4], [152.0, 45.8],
                [162.1, 53.6], [170.0, 73.2], [160.2, 52.1], [161.3, 67.9], [166.4, 56.6],
                [168.9, 62.3], [163.8, 58.5], [167.6, 54.5], [160.0, 50.2], [161.3, 60.3],
                [167.6, 58.3], [165.1, 56.2], [160.0, 50.2], [170.0, 72.9], [157.5, 59.8],
                [167.6, 61.0], [160.7, 69.1], [163.2, 55.9], [152.4, 46.5], [157.5, 54.3],
                [168.3, 54.8], [180.3, 60.7], [165.5, 60.0], [165.0, 62.0], [164.5, 60.3],
                [156.0, 52.7], [160.0, 74.3], [163.0, 62.0], [165.7, 73.1], [161.0, 80.0],
                [162.0, 54.7], [166.0, 53.2], [174.0, 75.7], [172.7, 61.1], [167.6, 55.7],
                [151.1, 48.7], [164.5, 52.3], [163.5, 50.0], [152.0, 59.3], [169.0, 62.5],
                [164.0, 55.7], [161.2, 54.8], [155.0, 45.9], [170.0, 70.6], [176.2, 67.2],
                [170.0, 69.4], [162.5, 58.2], [170.3, 64.8], [164.1, 71.6], [169.5, 52.8],
                [163.2, 59.8], [154.5, 49.0], [159.8, 50.0], [173.2, 69.2], [170.0, 55.9],
                [161.4, 63.4], [169.0, 58.2], [166.2, 58.6], [159.4, 45.7], [162.5, 52.2],
                [159.0, 48.6], [162.8, 57.8], [159.0, 55.6], [179.8, 66.8], [162.9, 59.4],
                [161.0, 53.6], [151.1, 73.2], [168.2, 53.4], [168.9, 69.0], [173.2, 58.4],
                [171.8, 56.2], [178.0, 70.6], [164.3, 59.8], [163.0, 72.0], [168.5, 65.2],
                [166.8, 56.6], [172.7, 105.2], [163.5, 51.8], [169.4, 63.4], [167.8, 59.0],
                [159.5, 47.6], [167.6, 63.0], [161.2, 55.2], [160.0, 45.0], [163.2, 54.0],
                [162.2, 50.2], [161.3, 60.2], [149.5, 44.8], [157.5, 58.8], [163.2, 56.4],
                [172.7, 62.0], [155.0, 49.2], [156.5, 67.2], [164.0, 53.8], [160.9, 54.4],
                [162.8, 58.0], [167.0, 59.8], [160.0, 54.8], [160.0, 43.2], [168.9, 60.5],
                [158.2, 46.4], [156.0, 64.4], [160.0, 48.8], [167.1, 62.2], [158.0, 55.5],
                [167.6, 57.8], [156.0, 54.6], [162.1, 59.2], [173.4, 52.7], [159.8, 53.2],
                [170.5, 64.5], [159.2, 51.8], [157.5, 56.0], [161.3, 63.6], [162.6, 63.2],
                [160.0, 59.5], [168.9, 56.8], [165.1, 64.1], [162.6, 50.0], [165.1, 72.3],
                [166.4, 55.0], [160.0, 55.9], [152.4, 60.4], [170.2, 69.1], [162.6, 84.5],
                [170.2, 55.9], [158.8, 55.5], [172.7, 69.5], [167.6, 76.4], [162.6, 61.4],
                [167.6, 65.9], [156.2, 58.6], [175.2, 66.8], [172.1, 56.6], [162.6, 58.6],
                [160.0, 55.9], [165.1, 59.1], [182.9, 81.8], [166.4, 70.7], [165.1, 56.8],
                [177.8, 60.0], [165.1, 58.2], [175.3, 72.7], [154.9, 54.1], [158.8, 49.1],
                [172.7, 75.9], [168.9, 55.0], [161.3, 57.3], [167.6, 55.0], [165.1, 65.5],
                [175.3, 65.5], [157.5, 48.6], [163.8, 58.6], [167.6, 63.6], [165.1, 55.2],
                [165.1, 62.7], [168.9, 56.6], [162.6, 53.9], [164.5, 63.2], [176.5, 73.6],
                [168.9, 62.0], [175.3, 63.6], [159.4, 53.2], [160.0, 53.4], [170.2, 55.0],
                [162.6, 70.5], [167.6, 54.5], [162.6, 54.5], [160.7, 55.9], [160.0, 59.0],
                [157.5, 63.6], [162.6, 54.5], [152.4, 47.3], [170.2, 67.7], [165.1, 80.9],
                [172.7, 70.5], [165.1, 60.9], [170.2, 63.6], [170.2, 54.5], [170.2, 59.1],
                [161.3, 70.5], [167.6, 52.7], [167.6, 62.7], [165.1, 86.3], [162.6, 66.4],
                [152.4, 67.3], [168.9, 63.0], [170.2, 73.6], [175.2, 62.3], [175.2, 57.7],
                [160.0, 55.4], [165.1, 104.1], [174.0, 55.5], [170.2, 77.3], [160.0, 80.5],
                [167.6, 64.5], [167.6, 72.3], [167.6, 61.4], [154.9, 58.2], [162.6, 81.8],
                [175.3, 63.6], [171.4, 53.4], [157.5, 54.5], [165.1, 53.6], [160.0, 60.0],
                [174.0, 73.6], [162.6, 61.4], [174.0, 55.5], [162.6, 63.6], [161.3, 60.9],
                [156.2, 60.0], [149.9, 46.8], [169.5, 57.3], [160.0, 64.1], [175.3, 63.6],
                [169.5, 67.3], [160.0, 75.5], [172.7, 68.2], [162.6, 61.4], [157.5, 76.8],
                [176.5, 71.8], [164.4, 55.5], [160.7, 48.6], [174.0, 66.4], [163.8, 67.3]]

        }],
        series_: []
    }

    $scope.gt = function(prop, val){
        return function(item){
            return item[prop] > val;
        }
    };

    function isLeaf(organization, index, orgs){
        return orgs.find(function(org){
            return org.organization && org.organization.id == organization.id;
        }) == null;
    }

    function init() {

        if($scope.selectedOrganization) {
            APIService.getOrganizations($scope.selectedOrganization.id).then(
                function success(data) {
                    if (data) {
                        $scope.organizations = data.filter(isLeaf);
                    }
                }
            );
        }
    }

    function init_() {

        $scope.prerequisiteTypes = [];
        $scope.haccps = [];


        $scope.loader.nonCompliances = true;

        APIService.getAllPrerequisitesByOrganizationId().then(
            function(data){
                $scope.prerequisites = data;


                APIService.getNoncompliancesByOrganizationId().then(
                    function(data){
                        $scope.noncompliances = data;

                        APIService.getMonitoringsByOrganizationId().then(
                            function(data){
                                $scope.monitorings = data;

                                var monitoringIds = $scope.monitorings.map(function(m){
                                    return m.id;
                                });
                                APIService.recursiveCall(monitoringIds, APIService.getOutcomeByMonitoringId).then(
                                    function(data){
                                        $scope.outcomes = data;


                                        APIService.getAnalysisParametersByOrganizationId().then(
                                            function(data){
                                                $scope.analysisParameters = data;

                                                APIService.getAnalysisParameterValuesByOrganizationId().then(
                                                    function(data){
                                                        $scope.analysisParameterValues = angular.copy(data);


                                                        var dates = ($filter('unique')($scope.analysisParameterValues.sort(function(a,b){
                                                            return a.date.getTime() - b.date.getTime();
                                                        }), 'date')).map(function(v){
                                                            return v.date;
                                                        })

                                                        $scope.dataAnalysisChartOptions.xAxis.categories = dates.map(function(d){
                                                            return $filter('date')(d, 'dd/MM/yy');
                                                        });

                                                        Prerequisite.TYPES.forEach(function(type) {
                                                            if( !Prerequisite.isCCP( { type : type })) {

                                                                var pre = {
                                                                    name : type,
                                                                    ncCount : $scope.noncompliances.filter(function(item){
                                                                        return item.prerequisiteType == type && item.closeDate == null;
                                                                    }).length,
                                                                };

                                                                var outcomes = {
                                                                    positive : $scope.outcomes.filter(function(item){
                                                                        return item.successfull == true;
                                                                    }).length,
                                                                    negative : $scope.outcomes.filter(function(item){
                                                                        return item.successfull == false;
                                                                    }).length
                                                                };


                                                                var prerequisiteIds = ($filter('unique')($scope.analysisParameterValues.filter(function(v){
                                                                    return v.prerequisiteType == type;
                                                                }), 'prerequisiteId')).map(function(v) {
                                                                    return v.prerequisiteId;
                                                                });

                                                                $log.info(type + ': ' + prerequisiteIds);


                                                                prerequisiteIds.forEach(function(pId){

                                                                    var data = [];
                                                                    dates.forEach(function(date){

                                                                        var value = $scope.analysisParameterValues.find(function(v){
                                                                            return v.date == date && v.prerequisiteId == pId && v.prerequisiteType == type;
                                                                        })

                                                                        data.push( value ? value.value : '');
                                                                    });

                                                                    var prerequisite = $scope.prerequisites.find(function(p){
                                                                        return p.type == type && p.id == pId;
                                                                    });

                                                                    var serie =  {
                                                                        name : prerequisite ? prerequisite.name: '---',
                                                                        data : data
                                                                    }

                                                                    $log.info('serie: ', serie);

                                                                    $scope.dataAnalysisChartOptions.series.push(serie);
                                                                });

                                                                var parameters = [];

                                                                var overThreshodData = [];

                                                                var overThreshodParameterValues =
                                                                    $scope.analysisParameterValues.filter(function(v){
                                                                        return v.prerequisiteType == type;
                                                                    }).sort(function(a,b){
                                                                        return b.date.getTime() - a.date.getTime();
                                                                    });

                                                                overThreshodParameterValues  = $filter('unique')( overThreshodParameterValues , 'parameterId','prerequisiteId').filter(function(v){

                                                                    var parameter = $scope.analysisParameters.find(function(p){
                                                                        return p.id == v.parameterId;
                                                                    });

                                                                    if(parameter && v.value > parameter.thresholdValue) {
                                                                        v.parameter = parameter;
                                                                        parameters.push(parameter);
                                                                        parameters = $filter('unique')( parameters , 'id');
                                                                        return true;
                                                                    }

                                                                    return false;
                                                                });



                                                                if(overThreshodParameterValues.length > 0){
                                                                    $log.info(type + " - parameters:", parameters);
                                                                    $log.info("overThreshodParameterValues:", overThreshodParameterValues);

                                                                    pre.overThreshodParameterValues = overThreshodParameterValues;
                                                                }



                                                                if(pre.ncCount > 0) {
                                                                    $scope.noncomplianceChartOptions.series[0].data.push({
                                                                        name: pre.name,
                                                                        y: pre.ncCount
                                                                    })
                                                                }

                                                                if(outcomes.positive > 0 || outcomes.negative > 0) {
                                                                    pre.outcomes = outcomes;

                                                                    $scope.monitoringsChartOptions.xAxis.categories.push(type);

                                                                    $scope.monitoringsChartOptions.series[0].data.push({
                                                                        name: pre.name,
                                                                        y: pre.outcomes.positive
                                                                    })
                                                                    $scope.monitoringsChartOptions.series[1].data.push({
                                                                        name: pre.name,
                                                                        y: pre.outcomes.negative
                                                                    })
                                                                }

                                                                $scope.prerequisiteTypes.push(pre);
                                                            };
                                                        });

                                                        $scope.loader.nonCompliances = false;

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

                                                                        var outcomes = {
                                                                            positive : $scope.outcomes.filter(function(item){
                                                                                return item.successfull == true;
                                                                            }).length,
                                                                            negative : $scope.outcomes.filter(function(item){
                                                                                return item.successfull == false;
                                                                            }).length
                                                                        };

                                                                        if(ccp.ncCount > 0) {
                                                                            $scope.noncomplianceChartOptions.series[0].data.push({
                                                                                name: ccp.name,
                                                                                y: ccp.ncCount
                                                                            })
                                                                        }

                                                                        if(outcomes.positive > 0 || outcomes.negative > 0) {

                                                                            ccp.outcomes = outcomes;

                                                                            $scope.monitoringsChartOptions.xAxis.categories.push(danger.name);

                                                                            $scope.monitoringsChartOptions.series[0].data.push({
                                                                                name: ccp.name,
                                                                                y: ccp.outcomes.positive
                                                                            })

                                                                            $scope.monitoringsChartOptions.series[1].data.push({
                                                                                name: ccp.name,
                                                                                y: ccp.outcomes.negative
                                                                            })
                                                                        }


                                                                        $scope.haccps.push(ccp);
                                                                    });


                                                                }

                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            }
        );
    };

    init();

});
