angular.module('APP')

	.directive('prerequisiteAnalysis', function () {
		return {
			restrict: "AE",
			replace: true,
			scope: {
				prerequisites: '=ngModel',
				prerequisiteType: "=",
			},
			require: ['ngModel', 'prerequisteType'],
			templateUrl: 'views/prerequisite/common/prerequisite.analysis.tmpl.html',
			controller: function ($scope, $state, $translate, $q, $uibModal, $log, $filter,
			                      PrerequisiteType, APIService, ResourceService) {

				$scope.PrerequisiteType = PrerequisiteType;

				$scope.analysisParameters = null;
				$scope.analysisParameterValues = null;

				$scope.chartData = {};

				var selectedOrganization = ResourceService.getSelectedOrganization();

				$scope.viewChart = function (prp, param) {

					$scope.chartData = {

						data: $scope.analysisParameterValues.filter(function (v) {
							return v.context.id == prp.context.id && v.analysisParameter.id == param.id;
						}).sort(function (a, b) {
							return b.date < a.date;
						}),

						series: [param.name],
						thresholdValue: param.thresholdValue,
						param: param,
						prp: prp

					}

				};

				function init() {

					if (!selectedOrganization) {
						return false;
					};

					APIService.getAnalysisParametersByOrganizationId(selectedOrganization.id).then(
						function (data) {

							$log.info("AnalysisParameters: %O", data);
							$scope.analysisParameters = data;

							var analysisParameterIds = $scope.analysisParameters.map(function (analysis) {
								return analysis.id;
							});

							APIService.recursiveCall(analysisParameterIds, APIService.getAnalysisParameterValuesByAnalysisParameterId).then(
								function (data) {

									var prerequisites = $scope.prerequisites.filter(function (prerequisite) {
										return prerequisite.prerequisiteType.name == $scope.prerequisiteType;
									});

									$scope.analysisParameterValues = data.filter(function (analysisParameterValue) {

										if (analysisParameterValue.context != null) {
											var prerequisite = prerequisites.find(function (prerequisite) {

												return prerequisite.context.id == analysisParameterValue.context.id
											});

											if (prerequisite) {

												return (prerequisite.prerequisiteType.name == $scope.prerequisiteType);

											}
										}


									}).sort(function (a, b) {
										return a.date < b.date;
									});

									$log.info("AnalysisParameterValues: %O", $scope.analysisParameterValues);

								});

						});

				}

				init();

			}

		}

	})

	.directive('prerequisiteMonitorings', function () {
		return {
			restrict: "AE",
			replace: true,
			scope: {
				element: "="
			},
			controller: function ($scope, $log, $uibModal, PrerequisiteType, Monitoring, Frequency, ModalService, APIService, ResourceService) {

				$scope.procedures = null;
				$scope.monitorings = null;
				$scope.relatedFrequency = null;
				$scope.userRoles = null;

				$scope.add = function () {
					showDetailModal(new Monitoring($scope.element.prerequisiteType, $scope.element.context), true);
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
						return p.id == item.procedure.id;
					});

					ModalService.dialogConfirm('Delete',
						'Monitoring for procedure <strong>' + procedure.title + '</strong> will be deleted. I proceed? ',
						function onConfirmAction() {
							$log.info("Deleting Monitoring: %O", item);
							return APIService.deleteMonitoring(item.id).then(
								function success() {

									if (item.frequency.type == "CUSTOM") {
										APIService.deleteFrequency(item.frequency.id);
									}

								}
							);
						}
					).then(loadMonitorings);
				};

				function showDetailModal(item, editMode) {

					var isNew = (item.id == null);

					var modalInstance = $uibModal.open({
						templateUrl: 'views/prerequisite/common/prerequisite.monitorings.detail.tmpl.html',
						size: 'lg',
						backdrop: 'static',
						resolve: {
							item: function () {
								return item;
							},
							procedures: function () {
								return $scope.procedures;
							},
							userRoles: function () {
								return $scope.userRoles;
							},
							editMode: function () {
								return editMode != null ? editMode : false;
							},
							relatedFrequency: function () {
								if ($scope.relatedFrequency) {
									return $scope.relatedFrequency;
								}
							}
						},
						controller: ['$scope', '$uibModalInstance', 'item', 'procedures', 'userRoles', 'editMode', 'relatedFrequency', 'Prerequisite', 'Monitoring', 'notify',
							function ($scope, $uibModalInstance, item, procedures, userRoles, editMode, relatedFrequency, PrerequisiteType, Monitoring, notify, ResourceService) {

								$scope.editMode = editMode;
								$scope.originalItem = item;
								$scope.item = angular.copy(item);
								$scope.procedures = procedures;
								$scope.frequencyScales = Frequency.PERIOD;
								$scope.userRoles = userRoles;
								$scope.relatedFrequency = relatedFrequency ? relatedFrequency : null;
								
								if ($scope.item.procedure && $scope.item.procedure.id) {
									$scope.item.procedure = procedures.find(function (procedure) {
										$scope.item.procedure.id === procedure.id
									});
								} else {
									$scope.item.procedure = procedures[0];
								}

								$scope.customFrequency = relatedFrequency && relatedFrequency.type == "CUSTOM" ? relatedFrequency : new Frequency($scope.item.procedure.riskClass, $scope.item.procedure.prerequisiteType);
								$scope.customFrequency.type = "CUSTOM";

								$scope.isCCP = ($scope.item.procedure.prerequisiteType.name == PrerequisiteType.DANGER);


								if ($scope.procedures && $scope.procedures.length == 1) {
									$scope.item.procedure = $scope.procedures[0];
								}

								if (relatedFrequency == null || (relatedFrequency.type == "DEFAULT" && $scope.item.frequency.type != "DEFAULT")) {
									$scope.item.frequencyRelatedToRiskClass = false;
									$scope.item.frequency.organization = $scope.item.procedure.organization;
									$scope.item.frequency.riskClass = $scope.item.procedure.riskClass;
									$scope.item.frequency.prerequisiteType = $scope.item.procedure.prerequisiteType;
								} else {
									$scope.item.frequency = relatedFrequency;
								}

								$scope.frequencyTypeLabel = function (value) {
									return value ? 'Related to risk class' : 'Custom';
								};

								$scope.getProcedureOptionLabel = function (procedure) {
									return procedure.title + '  [' +
										(procedure.riskClass != null ? procedure.riskClass.name + ' class' : 'Any risk class')
										+ ']';
								};

								$scope.onRelatedFrequencyChange = function (related) {

									related ? $scope.item.frequency = relatedFrequency : $scope.item.frequency = new Frequency($scope.item.frequency.riskClass, $scope.item.procedure.prerequisiteType);

								};

								$scope.save = function () {

									var varFrequencyRelatedToRiskClass = $scope.item.frequencyRelatedToRiskClass;

									if ($scope.item.id == null) {

										if (!varFrequencyRelatedToRiskClass) {

											if ($scope.item.frequency.justOnce ||
												$scope.item.frequency.asNeeded ||
												$scope.item.frequency.value > 0) {

												// Frequency.type = "CUSTOM"
												$scope.item.frequency.type = "CUSTOM";

											} else {

												notify.logWarning('Warning', 'A custom frequency must have a field checked.');
												return false;

											}

										}

										delete $scope.item.frequencyRelatedToRiskClass;
										delete $scope.item.prerequisiteType;

										// Creo Monitoring
										$log.info("Creating Monitoring: %O", $scope.item);
										APIService.createMonitoring($scope.item).then(
											function success(item) {

												item.frequencyRelatedToRiskClass = varFrequencyRelatedToRiskClass;
												$uibModalInstance.close(item);
												notify.logSuccess('Success', 'Prerequisite monitoring successfully added');
											},
											savingError
										);

									} else {

										// Se la Frequency è CUSTOM
										if (!varFrequencyRelatedToRiskClass) {

											if ($scope.item.frequency.justOnce ||
												$scope.item.frequency.asNeeded ||
												$scope.item.frequency.value > 0) {

												// Frequency.type = "CUSTOM"
												$scope.item.frequency.type = "CUSTOM";


											} else {

												notify.logWarning('Warning', 'A custom frequency must have a field checked.');
												return false;

											}

										}

										if ($scope.item.frequency.justOnce == item.frequency.justOnce &&
											$scope.item.frequency.asNeeded == item.frequency.asNeeded &&
											$scope.item.frequency.value == item.frequency.value) {

											notify.logWarning('Warning', 'Change something before saving again.');
											return false;

										}


										delete $scope.item.frequencyRelatedToRiskClass;
										delete $scope.item.prerequisiteType;

										// Update Monitoring
										$log.info("Updating Monitoring: %O", $scope.item);
										APIService.updateMonitoring($scope.item).then(
											function success(data) {

												if (item.frequency.type == "CUSTOM") {

													$log.info("Deleting Frequency: %O", item.frequency);
													APIService.deleteFrequency(item.frequency.id).then(
														function success() {

															data.frequencyRelatedToRiskClass = varFrequencyRelatedToRiskClass;
															$uibModalInstance.close(data);
															notify.logSuccess('Success', 'Prerequisite monitoring successfully updated');

														}
													);

												} else {

													data.frequencyRelatedToRiskClass = varFrequencyRelatedToRiskClass;
													$uibModalInstance.close(data);
													notify.logSuccess('Success', 'Prerequisite monitoring successfully updated');

												}

											},
											savingError
										);

									}

								};

								$scope.cancel = function () {
									$uibModalInstance.dismiss();
								};

								function savingError() {
									$scope.loader = false;
									$scope.errorMessage = "Saving data error!";
								}
							}
						]
					});


					modalInstance.result.then(
						function confirm(item) {
							loadMonitorings();
						}, function dismiss() {
							$log.info('Modal dismissed at: ' + new Date());
						});
				}


				function loadMonitorings() {
					APIService.getMonitoringsByOrganizationId(ResourceService.getSelectedOrganization().id).then(
						function success(data) {

							$log.info("Monitorings: %O", data);
							$scope.monitorings = data.filter(function (m) {
									return $scope.element.context && m.context.id == $scope.element.context.id;
								}
							);

							$log.info("Monitorings: %O", $scope.monitorings);
						});
				};

				function init() {
					APIService.getProceduresByOrganizationId(ResourceService.getSelectedOrganization().id).then(
						function success(data) {

							$scope.procedures = data;

							$scope.procedures = data.filter(function (p) {
								return (p.prerequisiteType.id == $scope.element.prerequisiteType.id &&
									(PrerequisiteType.isCCP($scope.element) || p.riskClass == null ||
									($scope.element.constrainedTo &&
									p.riskClass.id == $scope.element.constrainedTo.riskClass.id ))
								);
							});

							$log.info("Procedures: %O", data);

							loadMonitorings();
						}
					);

					APIService.getFrequenciesByOrganizationId(ResourceService.getSelectedOrganization().id).then(
						function success(data) {


							$log.info("Frequency: %O", data)
							var frequencies = data.filter(function (f) {
								if (f.prerequisiteType.id == $scope.element.prerequisiteType.id) {
									return f;
								}
							});

							if (frequencies) {
								$scope.relatedFrequency = frequencies.find(function (f) {
									return $scope.element.constrainedTo &&
										f.riskClass.id == $scope.element.constrainedTo.riskClass.id;
								});
							}

							$log.info("Frequency: %O", $scope.relatedFrequency)

						}
					);
				}

				init();

			},
			templateUrl: 'views/prerequisite/common/prerequisite.monitorings.tmpl.html'
		}
			;
	})

	.directive('prerequisiteProcessChecks', function () {
		return {
			restrict: "AE",
			replace: true,
			scope: {
				prerequisiteType: "="
			},
			controller: function ($scope, $log, $uibModal, ProcessCheck, Frequency, ModalService, APIService) {

				$scope.items = null;

				$scope.add = function () {
					showDetailModal(new ProcessCheck($scope.prerequisiteType), true);
				};

				$scope.edit = function (item) {
					showDetailModal(item, true);
				};

				$scope.view = function (item) {
					showDetailModal(item, false);
				};

				$scope.delete = function (item) {
					ModalService.dialogConfirm('Delete',
						'Process check <strong>' + item.title + '</strong> will be deleted. I proceed? ',
						function onConfirmAction() {
							return APIService.deleteProcessCheck(item.id);
						}
					).then(init);
				}

				function showDetailModal(item, editMode) {

					var isNew = (item.id == null);

					var modalInstance = $uibModal.open({
						templateUrl: 'views/prerequisite/common/prerequisite.processCheck.detail.tmpl.html',
						size: 'lg',
						backdrop: 'static',
						resolve: {
							item: function () {
								return item;
							},
							editMode: function () {
								return editMode;
							}
						},
						controller: ['$scope', '$uibModalInstance', 'item', 'editMode', 'ProcessCheck', 'notify',
							function ($scope, $uibModalInstance, item, editMode, ProcessCheck, notify) {

								$scope.editMode = editMode;
								$scope.originalItem = item;
								$scope.item = angular.copy(item);

								$scope.processCheckTypes = ProcessCheck.TYPE;

								$scope.save = function () {
									$scope.loader = true;
									if ($scope.item.id == null) {
										APIService.createProcessCheck($scope.item).then(
											function success(item) {
												$uibModalInstance.close(item);
												notify.logSuccess('Success', 'Process check successfully added');
											},
											savingError
										);
									} else {
										APIService.updateProcessCheck($scope.item).then(
											function success(item) {
												$uibModalInstance.close(item);
												notify.logSuccess('Success', 'Process check successfully updated');
											},
											savingError
										);
									}
								};

								$scope.cancel = function () {
									$uibModalInstance.dismiss();
								};

								function savingError() {
									$scope.loader = false;
									$scope.errorMessage = "Saving data error!";
								}
							}]
					});

					modalInstance.result.then(
						function confirm(item) {
							init();
						}, function dismiss() {
							$log.info('Modal dismissed at: ' + new Date());
						});
				}

				function init() {
					APIService.getProcessChecksByOrganizationId().then(
						function success(data) {
							$scope.items = data.filter(function (p) {
								return p.prerequisiteType == $scope.prerequisiteType;
							});
						}
					);
				}

				init();

			},
			templateUrl: 'views/prerequisite/common/prerequisite.processChecks.tmpl.html'
		};
	})


;




