'use strict';

angular.module('APP')
	.controller('StaffHygieneMonitoringsCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
	                                                     Frequency, PrerequisiteType, Monitoring, StaffHygiene, APIService, ResourceService) {
		$scope.prerequisites = null;
		$scope.procedures = null;
		$scope.monitorings = null;
		$scope.userRoles = null;
		$scope.people = null;
		$scope.outcomes = null;
		$scope.items = [];

		$scope.loading = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		$scope.add = function () {
			var prerequisiteType = new PrerequisiteType(10);
			prerequisiteType.name = PrerequisiteType.TYPES.STAFF_HYGIENE;
			showDetailModal(new Monitoring(prerequisiteType), true);
		};

		$scope.edit = function (item) {
			showDetailModal(item, true);
		};

		$scope.view = function (item) {
			showDetailModal(item, false);
		};

		$scope.delete = function (item) {

			$log.info(item);

			var procedure = $scope.procedures.find(function (p) {
				return p.id == item.procedureId;
			});

			ModalService.dialogConfirm('Delete',
				'Monitoring for procedure <strong>' + procedure.title + '</strong> will be deleted. I proceed? ',
				function onConfirmAction() {
					return APIService.deleteMonitoring(item.id);
				}
			).then(loadMonitorings);
		};

		function showDetailModal(item, editMode) {

			var isNew = (item.id == null);

			var modalInstance = $uibModal.open({
				templateUrl: 'views/prerequisite/staffHygiene/staffHygiene.monitorings.detail.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					item: function () {
						return item;
					},
					procedures: function () {
						return $scope.procedures;
					},
					prerequisites: function () {
						return $scope.prerequisites;
					},
					userRoles: function () {
						return $scope.userRoles;
					},
					editMode: function () {
						return editMode != null ? editMode : false;
					},
					selectedOrganization: function () {
						return $scope.selectedOrganization;
					}
				},
				controller: ['$scope', '$uibModalInstance', 'item', 'procedures', 'prerequisites', 'userRoles', 'editMode', 'selectedOrganization', 'Monitoring', 'StaffHygiene', 'notify',
					function ($scope, $uibModalInstance, item, procedures, prerequisites, userRoles, editMode, selectedOrganization, Monitoring, StaffHygiene, notify) {

						$scope.editMode = editMode;
						$scope.originalItem = item;
						$scope.item = angular.copy(item);
						$scope.procedures = procedures;
						$scope.frequencyPeriods = Frequency.PERIOD;
						$scope.userRoles = userRoles;
						$scope.prerequisites = prerequisites;

						if ($scope.procedures && $scope.procedures.length == 1) {
							$scope.item.procedureId = procedures[0].id;
						}

						$scope.save = function () {

							var prerequisite = prerequisites.find(function (p) {
								return $scope.item.destinationRole != null && p.role.id == $scope.item.destinationRole.id;
							});

							if (prerequisite == null) {

								prerequisite = new StaffHygiene();
								prerequisite.role = $scope.item.destinationRole;

								$log.info("Creating StaffHygiene: %O", prerequisite);
								APIService.createStaffHygiene(prerequisite).then(
									function (data) {

										prerequisite = data;
										saveMonitoring($scope.item, prerequisite.context);

									});

							} else {

								saveMonitoring($scope.item, prerequisite.context);

							}

						};

						$scope.cancel = function () {
							$uibModalInstance.dismiss();
						};

						function saveMonitoring(item, prerequisiteContext) {

							item.context = prerequisiteContext;
							delete item.destinationRole;
							delete item.frequencyRelatedToRiskClass;
							item.frequency.prerequisiteType = item.prerequisiteType;
							delete item.prerequisiteType;

							if (item.id == null) {

								item.frequency.type = "CUSTOM";
								$log.info("Creating Monitoring: %O", item);
								APIService.createMonitoring(item).then(
									function success(item) {

										$uibModalInstance.close(item);
										notify.logSuccess('Success', 'StaffHygiene monitoring successfully added');

									}, savingError);

							} else {

								$log.info("Updating Monitoring: %O", item);
								APIService.updateMonitoring(item).then(
									function success(item) {

										$uibModalInstance.close(item);
										notify.logSuccess('Success', 'StaffHygiene monitoring successfully updated');
									}, savingError);

							}

						}

						function savingError() {
							$scope.loader = false;
							$scope.errorMessage = "Saving data error!";
						}

					}]

			});

			modalInstance.result.then(
				function confirm(item) {
					loadMonitorings();
				}, function dismiss() {
					$log.info('Modal dismissed at: ' + new Date());
				});

		}

		function loadMonitorings() {

			APIService.getStaffHygienesByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$log.info("Prerequisites: %O", data);
					$scope.prerequisites = data;

					var prerequisiteIds = $scope.prerequisites.map(function (p) {
						return p.id;
					});

					APIService.getMonitoringsByOrganizationId($scope.selectedOrganization.id).then(
						function success(data) {

							var prerequisiteContextIds = $scope.prerequisites.map(function (p) {
								return p.context.id;
							});

							$scope.monitorings = data.filter(function (monitoring) {

								return prerequisiteContextIds.indexOf(monitoring.context.id) != -1;

							});
							$log.info("Monitorings: %O", $scope.monitorings);

							var monitoringIds = $scope.monitorings.map(function (p) {
								return p.id;
							});

							APIService.recursiveCall(monitoringIds, APIService.getOutcomeByMonitoringId).then(
								function success(data) {

									$log.info("Outcomes: %O", data);
									$scope.outcomes = data;

									$scope.items = [];

									$scope.monitorings = $scope.monitorings.map(function (monitoring) {

										var prerequisite = $scope.prerequisites.find(function(prerequisite){

											return monitoring.context.id == prerequisite.context.id;

										});

										monitoring.destinationRole = prerequisite.role;

										return monitoring;

										// var item = {
										// 	destinationRole: $scope.userRoles.find(function (r) {
										// 		var pr = $scope.prerequisites.find(function (p) {
										// 			return p.context.id == m.context.id;
										// 		});
										// 	})
										// };
										//
										// $scope.items.push(item);

									});

									$scope.loading = false;

								});

						});

				});

		}

		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			APIService.getRolesByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$log.info("Roles: %O", data);
					$scope.userRoles = data;

					APIService.getUsersByOrganizationId($scope.selectedOrganization.id).then(
						function success(data) {

							$log.info("Users: %O", data);
							$scope.people = data;

							APIService.getProceduresByOrganizationId($scope.selectedOrganization.id).then(
								function success(data) {

									$scope.procedures = data.filter(function (p) {
										return p.prerequisiteType.name == PrerequisiteType.STAFF_HYGIENE;
									});
									$log.info("Procedures: %O", $scope.procedures);

									loadMonitorings();

								});

						});

				});

		}

		init();

	});
