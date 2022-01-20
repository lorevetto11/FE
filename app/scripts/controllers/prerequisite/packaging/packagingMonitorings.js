'use strict';

angular.module('APP')
	.controller('PackagingMonitoringsCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, notify,
	                                                  PackagingMaterial, Frequency, PrerequisiteType, Monitoring,
	                                                  APIService, ResourceService) {

		$scope.monitorings = null;
		$scope.materials = null;

		$scope.procedures = null;
		$scope.roles = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		$scope.loading = null;

		$scope.add = function () {
			var prerequisiteType = new PrerequisiteType(12);
			prerequisiteType.name = PrerequisiteType.TYPES.PACKAGING_MATERIAL;
			showDetailModal(new Monitoring(prerequisiteType), true);
		};

		$scope.edit = function (item) {
			showDetailModal(item, true);
		};

		$scope.view = function (item) {
			showDetailModal(item, false);
		};

		$scope.delete = function (item) {

			$log.info("Deleting Monitoring: %O", item);

			var procedure = $scope.procedures.find(function (p) {
				return p.id == item.procedureId;
			});

			ModalService.dialogConfirm('Delete',
				'Monitoring for procedure <strong>' + procedure.title + '</strong> will be deleted. I proceed? ',
				function success() {
					return APIService.deleteMonitoring(item.id);
				}.then(loadMonitorings)
			)

		};

		function showDetailModal(item, editMode) {

			var modalInstance = $uibModal.open({
				templateUrl: 'views/prerequisite/packaging/packaging.monitorings.detail.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					monitoring: function () {
						return item;
					},
					materials: function () {
						return $scope.materials;
					},
					procedures: function () {
						return $scope.procedures;
					},
					roles: function () {
						return $scope.roles;
					},
					editMode: function () {
						return editMode != null ? editMode : false;
					},
					selectedOrganization: function () {
						return $scope.selectedOrganization;
					}
				},
				controller: ['$scope', '$uibModalInstance', 'monitoring', 'materials', 'procedures', 'roles', 'editMode', 'selectedOrganization', 'PackagingMaterial', 'Monitoring', 'StaffHygiene',
					function ($scope, $uibModalInstance, monitoring, materials, procedures, roles, editMode, selectedOrganization, PackagingMaterial, Monitoring) {

						$scope.originalMonitoring = monitoring;
						$scope.monitoring = angular.copy(monitoring);
						$scope.materials = materials;
						$scope.editMode = editMode;
						$scope.selectedOrganization = selectedOrganization;

						$scope.procedures = procedures;
						$scope.roles = roles;

						$scope.frequencyPeriods = Frequency.PERIOD;

						$scope.save = function () {

							$scope.monitoring.frequency.prerequisiteType = $scope.monitoring.prerequisiteType;
							delete $scope.monitoring.prerequisiteType;
							delete $scope.monitoring.frequencyRelatedToRiskClass;

							if ($scope.monitoring.id == null) {

								$scope.monitoring.frequency.type = "CUSTOM";
								$log.info("Creating Monitoring: %O", $scope.monitoring);
								APIService.createMonitoring($scope.monitoring).then(
									function success(item) {

										$uibModalInstance.close(item);
										notify.logSuccess('Success', 'Packaging material monitoring successfully created');

									}, savingError);

							} else {

								$scope.monitoring.frequency.organization = $scope.monitoring.organization;
								$scope.monitoring.frequency.prerequisiteType = $scope.monitoring.procedure.prerequisiteType;
								$log.info("Updating Monitoring: %O", $scope.monitoring.frequency);
								APIService.updateFrequency($scope.monitoring.frequency).then(
									function success() {

										$log.info("Updating Monitoring: %O", $scope.monitoring);
										APIService.updateMonitoring($scope.monitoring).then(
											function success(item) {

												$uibModalInstance.close(item);
												notify.logSuccess('Success', 'Packaging material monitoring successfully updated');

											}, savingError);

									}, savingError);

							}

						};

						$scope.cancel = function () {
							$uibModalInstance.dismiss();
						};

						function savingError() {
							$scope.loading = false;
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

		function savingError() {
			$scope.loading = false;
			$scope.errorMessage = "Saving data error!";
		}

		function loadProceduresAndRoles() {

			if ( $scope.procedures == null
				&& $scope.roles == null ) {

				$scope.loading = true;

				APIService.getProceduresByOrganizationId($scope.selectedOrganization.id).then(
					function success(data) {

						$scope.procedures = data;
						$log.info("Procedures: %O", $scope.procedures);

						APIService.getRolesByOrganizationId($scope.selectedOrganization.id).then(
							function success(data) {

								$scope.roles = data;
								$log.info("Roles: %O", $scope.roles);

								loadMonitorings();

							}, savingError);

					}, savingError);

			}

		}

		function loadMonitorings() {

			$scope.loading = true;

			APIService.getMonitoringsByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$scope.monitorings = data.filter(function (monitoring) {

						return $scope.materials.find(function (material) {
							return monitoring.context
								&& material.context
								&& monitoring.context.id === material.context.id;
						});

					});
					$log.info("Monitorings: %O", $scope.monitorings);

					$scope.loading = false;

				}, savingError);

		}

		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			APIService.getMaterialsByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$scope.materials = data.filter(function(material){
						return material.type === PackagingMaterial.TYPES.PACKAGING;
					});
					$log.info("Materials: %O", $scope.materials);

					loadProceduresAndRoles();

				}, savingError);

		}

		init();

	});
