angular.module('APP')

	.directive('phaseMonitorings', function () {

		var directive = {
			restrict: "AE",
			replace: true,
			scope: {
				phase: "="
			},
			controller: function ($scope, $log, $uibModal, PrerequisiteType, Monitoring, Frequency, ModalService, APIService, ResourceService) {

				$scope.procedures = null;
				$scope.monitorings = null;
				
				$scope.selectedOrganization = ResourceService.getSelectedOrganization();
				
				var prerequisiteType = new PrerequisiteType( 15, "Any\u0200prerequisite\u0200type" );
				var changedSelectedOrganization = ResourceService.getSelectedOrganization();
				if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
					$scope.selectedOrganization = changedSelectedOrganization;
					init();
				}

				$scope.add = function (  ) {
					showDetailModal( new Monitoring( prerequisiteType, $scope.phase.context ), true );
				};

				$scope.edit = function ( item ) {
					showDetailModal( item, true );
				};

				$scope.view = function ( item ) {
					showDetailModal( item, false );
				};

				$scope.delete = function ( item ) {

					var procedure = $scope.procedures.find( function ( procedure ) {
						return procedure.id === item.procedure.id;
					});

					ModalService.dialogConfirm( 'Delete', 'Monitoring for procedure <strong>' + procedure.title + '</strong> will be deleted. I proceed? ',
						function onConfirmAction() {

							$log.info("Deleting Monitoring: %O", item);
							return APIService.deleteMonitoring( item.id ).then(
								function (  ) {

									APIService.deleteFrequency( item.frequency.id );

								});

						}
					).then( loadMonitorings );

				};

				function showDetailModal(item, editMode) {

					var isNew = item.id == null;

					var modalInstance = $uibModal.open({
						size: 'lg',
						backdrop: 'static',
						resolve: {
							item: function (  ) {
								return item;
							},
							procedures: function (  ) {
								return $scope.procedures;
							},
							editMode: function (  ) {
								return editMode != null ? editMode : false;
							},
							frequency: function () {
								return item.frequency
							}
						},
						controller: ['$scope', '$uibModalInstance', 'item', 'procedures', 'editMode', 'frequency', 'Prerequisite', 'Monitoring', 'notify',
							function ($scope, $uibModalInstance, item, procedures, editMode, frequency, PrerequisiteType, Monitoring, notify, ResourceService) {

								$scope.editMode = editMode;
								$scope.originalItem = item;
								$scope.item = angular.copy(item);
								$scope.procedures = procedures;
								$scope.frequencyScales = Frequency.PERIOD;

								$scope.frequency = frequency;

								if (item.id != null) {
									$scope.item.procedure = $scope.procedures.find(function ( procedure ) {
										return procedure.id === $scope.item.procedure.id;
									});
								}

								$scope.save = function () {

									if ($scope.item.frequency.justOnce ||
										$scope.item.frequency.asNeeded ||
										$scope.item.frequency.value > 0) {

										// Frequency.type = "CUSTOM"
										$scope.item.frequency.type = "CUSTOM";

										delete $scope.item.frequencyRelatedToRiskClass;
										delete $scope.item.prerequisiteType;

										$scope.item.frequency.organization = $scope.item.organization;
										$scope.item.frequency.prerequisiteType = $scope.item.procedure.prerequisiteType;

										$scope.loading = true;
										if ($scope.item.id == null) {

											$log.info("Creating Monitoring: %O", $scope.item);
											APIService.createMonitoring($scope.item).then(
												function success(item) {

													$uibModalInstance.close(item);
													notify.logSuccess('Success', 'Prerequisite monitoring successfully added');
													$scope.loading = false;

												}, savingError);

										} else {

											$log.info("Updating Frequency: %O", $scope.item.frequency);
											APIService.updateFrequency($scope.item.frequency).then(
												function success(data) {

													$uibModalInstance.close(item);
													notify.logSuccess('Success', 'Prerequisite monitoring successfully updated');
													$scope.loading = false;

												}, savingError);

										}

									} else {

										notify.logWarning('Warning', 'A custom frequency must have a field checked.');
										return false;

									}

								};

								$scope.cancel = function (  ) {
									$uibModalInstance.dismiss(  );
								};

								$scope.changeProcedure = function (  ) {

									var procedure = $scope.procedures.find(function ( procedure ) {
										if (procedure.id === $scope.item.procedure.id) {
											return procedure;
										}
									});

									$scope.item.procedure = procedure;
								};

								function savingError(  ) {
									$scope.loading = false;
									$scope.errorMessage = "Saving data error!";
								}

							}

						],
						templateUrl: 'views/danger/common/phase.monitorings.detail.tmpl.html'
					});


					modalInstance.result.then(
						function confirm( item ) { loadMonitorings() },
						function dismiss(  ) { $log.info('Modal dismissed at: ' + new Date()) }
					);

				}

				function savingError(  ) {
					$scope.loading = false;
					$scope.errorMessage = "Saving data error!";
				}

				function loadMonitorings(  ) {

					$scope.loading = true;
					APIService.getMonitoringsByOrganizationId($scope.selectedOrganization.id).then(
						function success(data) {

							$scope.monitorings = data.filter(function ( monitoring ) {
								return $scope.phase.context && monitoring.context.id == $scope.phase.context.id;
							});
							$log.info("Monitorings: %O", $scope.monitorings);

							// var frequencyIds = $scope.monitorings.map(function ( monitoring ) {
							// 	return monitoring.frequency.id;
							// }, savingError);

							// APIService.getFrequenciesByOrganizationId($scope.selectedOrganization.id).then(
							// 	function success(data) {
							//
							// 		$scope.frequencies = data.filter(function ( frequency ) {
							// 			return frequency.prerequisiteType.id === prerequisiteType.id
							// 				&& frequencyIds.includes(frequency.id); // TODO maybe to use find or loop trough array for legacy browser
							// 		});
							// 		$log.info("Frequencies: %O", $scope.frequencies);

									$scope.$emit("numMonitorings", $scope.monitorings.length);

									$scope.loading = false;

								// }, savingError);

						});

				}

				function init(  ) {

					if ( $scope.selectedOrganization == null ) {
						return;
					}

					$scope.loading = true;
					APIService.getProceduresByOrganizationId($scope.selectedOrganization.id).then(
						function success(data) {
							console.log(data);
							$scope.procedures = data.filter( function( procedure ) {
								return procedure.prerequisiteType.name === $scope.phase.typeCCP;
							});
							$log.info("Procedures: %O", $scope.procedures);

							loadMonitorings();

						}, savingError);

				}

				init();

			},
			templateUrl: 'views/danger/common/phase.monitorings.tmpl.html'
		};

		return directive;

	});