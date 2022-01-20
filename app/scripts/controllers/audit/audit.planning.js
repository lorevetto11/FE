'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
    .controller('AuditPlanningCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $filter, $timeout, Command, Layout, Shape, Color, Procedure,
                                               Prerequisite, SystemCheck, SystemCheckPlanning, ProcessCheckPlanning, currentUser, currentOrganization, ValidationService, uiCalendarConfig, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

        $scope.items = null;
        $scope.systemChecks = null;
        $scope.processChecks = null;
        $scope.filter = {};
        $scope.companies = null;
        $scope.kinshipLevels = null;
        $scope.loading = false;

        $scope.selectedOrganization = ResourceService.getSelectedOrganization();

        $scope.$on('resourceChange', function () {

            var changedSelectedOrganization = ResourceService.getSelectedOrganization();
            if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
                $scope.selectedOrganization = changedSelectedOrganization;
                init();
            }

        });

        var COMPANY_COLOR = {
            'company 1': '#96BF0D',
            'company 2': '#FFB61C',
            'company 3': '#6A55C2',
            'company 4': '#2EC1CC'
        };


        $scope.addSystemCheck = function () {
            var newItem = new SystemCheckPlanning();
            newItem.systemchecks.push(null);
            $scope.selectedItem = newItem;
        };

        $scope.addProcessCheck = function () {
            var newItem = new ProcessCheckPlanning();
            newItem.processchecks.push(null);
            $scope.selectedItem = newItem;
        };

        $scope.edit = function (item) {
            $scope.selectedItem = angular.copy(item);
        };

        $scope.cancel = function () {
            $scope.selectedItem = null
        };


        $scope.delete = function (item) {

            ModalService.dialogConfirm('Delete',
                'System check planned on <strong>' + $filter('date')(item.date, 'dd MMM yyyy') + '</strong> will be deleted. I proceed? ',
                function onConfirmAction() {

                    $scope.selectedItem = null;

                    var predicate = $scope.isSystemCheck(item) ?
                        APIService.deleteSystemCheckPlanning : APIService.deleteProcessCheckPlanning;

                    return predicate(item.id);

                }
            ).then(init);
        };

        $scope.isSystemCheck = function (item) {
            return item instanceof SystemCheckPlanning;
        };

        $scope.isProcessCheck = function (item) {
            return item instanceof ProcessCheckPlanning;
        };

        $scope.clone = function (item) {
            var clone = angular.copy(item);
            clone.id = null;
            $scope.selectedItem = clone;
        };

        $scope.save = function (item, form) {

            if (form.$invalid) {
                ValidationService.dirtyForm(form);
                return false;
            }

            if (item.id == null) {

                // if ($scope.isSystemCheck(item)) {
                //     var systemchecks = [];
                //     item.systemchecks.forEach(function(systemId){
                //
                //         systemchecks.push($scope.systemChecks.find(function(system){
                //
                //             return system.id == systemId;
                //
                //         }));
                //
                //     });
                //     item.systemchecks = systemchecks
                // } else if ($scope.isProcessCheck(item)) {
                //     var processchecks = [];
                //     item.processchecks.forEach(function(processId){
                //
                //         processchecks.push($scope.processChecks.find(function(process){
                //
                //             return process.id == processId;
                //
                //         }));
                //
                //     });
                //     item.processchecks = processchecks;
                // }

                var predicate = $scope.isSystemCheck(item) ?
                    APIService.createSystemCheckPlanning : APIService.createProcessCheckPlanning;

                $log.info("Creating planning: %O", item);
                predicate(item).then(
                    function success(item) {

                        $scope.selectedItem = item;
                        notify.logSuccess('Success', 'new planning successfully created');
                        init();

                    }, savingError);

            } else {

                var predicate = $scope.isSystemCheck(item) ?
                    APIService.updateSystemCheckPlanning : APIService.updateProcessCheckPlanning;

                $log.info("Updating planning: %O", item);
                predicate(item).then(
                    function success(item) {

                        $scope.selectedItem = item;
                        notify.logSuccess('Success', 'planning successfully updated');
                        init();

                    }, savingError);

            }

        };

        function savingError() {
            $scope.loader = false;
            $scope.errorMessage = "Saving data error!";
        }

        $scope.itemsFilter = function (item) {

            var result = true;

            if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
                var keyword = $scope.filter.keyword.toLowerCase();
                result &= (item.name && item.name.toLowerCase().indexOf(keyword) != -1);
            }

            return result;
        };

        $scope.isValid = function (item) {
            return true;
        };

        $scope.deleteCheck = function (item, index) {
            if ($scope.isSystemCheck(item)) {
                item.systemchecks.splice(index, 1);
            } else if ($scope.isProcessCheck(item)) {
                item.processchecks.splice(index, 1);
            }
        };

        $scope.addCheck = function (item) {
            if ($scope.isSystemCheck(item)) {
                item.systemchecks.push(null);
            } else if ($scope.isProcessCheck(item)) {
                item.processchecks.push(null);
            }
        };

        $scope.inlineOptions = {
            minDate: new Date(),
            showWeeks: true
        };

        $scope.dateOptions = {
            dateDisabled: function (data) {
                // Disable weekend selection
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            },
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22), // TODO are you sure this is the max date? just don't let another 2000 re-happen
            minDate: new Date(),
            startingDay: 1
        };

        $scope.open = function () {
            $scope.popup.opened = true;
        };

        $scope.popup = {
            opened: false
        };

        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: true,
                header: {
                    left: 'title',
                    center: '',
                    right: 'today prev,next'
                },
                eventClick: function (date, jsEvent, view) {
                    $scope.selectedItem = null;
                    $timeout(function () {
                        $scope.selectedItem = date.data;
                    }, 100);
                },
                eventDrop: function (event, delta, revertFunc, jsEvent, ui, view) {
                    if (event.data) {
                        event.data.date = new Date(event.data.date.getTime() + delta);
                        $scope.save(event.data);
                    }
                },
                eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
                    $log.info('Event Resized to make dayDelta ' + delta);
                },
                /*eventRender: function( event, element, view ) {
                 element.attr({'tooltip': event.title,
                 'tooltip-append-to-body': true});
                 $compile(element)($scope);
                 }*/
            }
        };


        function buildEvents() {
            $scope.eventSources = null;
            $timeout(function () {
                if ($scope.items) {
                    $scope.events = [];
                    $scope.eventSources = [];

                    $scope.items.forEach(function (item) {

                        var event = {
                            title: ($scope.isSystemCheck(item) ? '[SC] ' : '[PC] ') + item.company.name,
                            start: new Date(item.date),
                            allDay: true,
                            //borderColor: COMPANY_COLOR[item.company], // TODO colore alle organizzazioni
                            data: item
                        };
                        $scope.events.push(event);
                    });
                    $scope.eventSources = [$scope.events];
                }
            }, 1);

        }

        function init() {


            if (!$scope.selectedOrganization) {
                return;
            }

            $scope.loading = true;

            APIService.getSystemChecksByOrganizationId($scope.selectedOrganization.id).then(
                function successCallback(data) {

                    $log.info("SystemChecks: %O", data);
                    $scope.systemChecks = data;

                    APIService.getProcessChecksByOrganizationId($scope.selectedOrganization.id).then(
                        function successCallback(data) {

                            $log.info("ProcessChecks: %O", data);
                            $scope.processChecks = data;

                            APIService.getSystemCheckPlanningsByOrganizationId($scope.selectedOrganization.id).then(
                                function successCallback(data) {

                                    $log.info("SystemCheck Plannings: %O", data);
                                    $scope.items = data;

                                    APIService.getProcessCheckPlanningsByOrganizationId($scope.selectedOrganization.id).then(
                                        function successCallback(data) {

                                            $log.info("ProcessCheck Plannings: %O", data);
                                            $scope.items = $scope.items.concat(data);

                                            APIService.getOrganizations($scope.selectedOrganization.id).then(
                                                function successCallback(data) {

                                                    $log.info("Companies: %O", data);
                                                    $scope.companies = UtilsService.organizationOrderTree(data);

                                                    setTimeout(function () {
                                                        $scope.kinshipLevels = UtilsService.organizationBuildKinshipLevel($scope.companies);
                                                    }, 0);

                                                    buildEvents();

                                                    $scope.loading = false;

                                                });

                                        });

                                });

                        });

                });

        }

        init();
    });
