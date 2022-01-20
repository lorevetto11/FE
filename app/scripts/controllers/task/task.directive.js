'use strict';


angular.module('APP') //TODO Da ottimizzare completamente la pagina

	.directive('taskList', function ($rootScope) {
		return {
			restrict: "AE",
			replace: true,
			scope: {
				isccp: '=',
				isoprp: '='
			},
			templateUrl: 'views/task/templates/task.list.tmpl.html',
			controller: 'TaskListCtrl'
		};
	})

	.controller('TaskListCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $filter, Command, Layout, Shape, Color, Entity,
	                                      PrerequisiteType, Frequency, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {


		$scope.items = null;
		$scope.monitoring = null;
		$scope.outcomes = null;
		$scope.people = null;
		$scope.userRoles = null;
		$scope.prerequisites = null;
		$scope.currentProcedure = null;
		$scope.loader = null;
		$scope.diagrams = null;
		$scope.entities = null;

		$scope.tasks = null;
		$scope.history = {
			justOnce : false
		}


		var currentAttachments = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		var currentUser = ResourceService.getCurrentUser();
		$scope.isAdmin = currentUser && currentUser.role && currentUser.role.name == 'Administrator';
		$scope.isVerifier = ResourceService.getIsVerifier();

		$scope.perform = function (monitoring, outcome) {
			showPerformModal(monitoring, null, true); // Fix: only create a new Outcome. This helps providing data consistency
		};

		$scope.viewOutcome = function (monitoring, outcome) {
			showPerformModal(monitoring, outcome, false);
		};

		$scope.viewProcedure = function (monitoring) {
			showProcedureModal(monitoring);
		};

		$scope.getDueDate = function (monitoringFrequency, lastMonitoredDate) {

			if (monitoringFrequency && ( !monitoringFrequency.asNeeded && !monitoringFrequency.justOnce)) {

				if (!lastMonitoredDate) {
					return new Date();
				} else {
					var dueDate = new Date(lastMonitoredDate);
					dueDate.setSeconds(0);
					dueDate.setMilliseconds(0);

					$log.info('lastMonitoredDate:', lastMonitoredDate + " - " + dueDate);

					if (monitoringFrequency.period == Frequency.PERIOD.HOUR) {
						dueDate.setHours(dueDate.getHours() + monitoringFrequency.value);
					} else if (monitoringFrequency.period == Frequency.PERIOD.DAY) {
						dueDate.setDate(dueDate.getDate() + monitoringFrequency.value);
					} else if (monitoringFrequency.period == Frequency.PERIOD.MONTH) {
						dueDate.setMonth(dueDate.getMonth() + monitoringFrequency.value);
					} else if (monitoringFrequency.period == Frequency.PERIOD.WEEK) {
						dueDate.setDate(dueDate.getDate() + monitoringFrequency.value * 7);
					} else if (monitoringFrequency.period == Frequency.PERIOD.YEAR) {
						dueDate.setFullYear(dueDate.getFullYear() + monitoringFrequency.value);
					}

					$log.info("duedate:", dueDate);

					return dueDate;
				}
			}
		};

		$scope.isToday = function (date) {

			if (date) {
				var now = new Date();

				var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

				return now > from && now < to;

			}

			return true;
		};

		$scope.isUntilToday = function (date) {

			if (date) {
				var now = new Date();

				var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

				return now > from;

			}

			return true;
		};

		function showProcedureModal(procedure) {

			var modalInstance = $uibModal.open({
				templateUrl: 'views/task/prerequisite/task.viewProcedure.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					item: function () {
						return procedure;
					},
					userRoles: function () {
						return $scope.userRoles;
					},
					isccp: function () {
						return $scope.isccp;
					}
				},
				controller: ['$scope', '$uibModalInstance', 'item', 'userRoles', 'isccp', 'Prerequisite',
					function ($scope, $uibModalInstance, item, userRoles, isccp, PrerequisiteType) {

						$scope.procedure = item;
						$scope.editMode = false;
						$scope.userRoles = userRoles;
						$scope.isCCP = isccp;

						$scope.cancel = function () {
							$uibModalInstance.dismiss();
						};

						$scope.currentProcedure = procedure;
					}]
			});
		}


		function showPerformModal(monitoring, outcome, editMode) {

			var modalInstance = $uibModal.open({
				templateUrl: 'views/task/prerequisite/task.perform.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					monitoring: function () {
						return monitoring;
					},
					outcome: function () {
						return outcome;
					},
					editMode: function () {
						return editMode != false;
					},
					examiner: function () {
						return currentUser;
					},
					prerequisites: function() {
						return $scope.prerequisites;
					}
				},
				controller: ['$scope', '$log', '$uibModalInstance', 'monitoring', 'outcome', 'examiner', 'editMode', 'prerequisites', 'Outcome', 'Noncompliance', 'APIService',
					function ($scope, $log, $uibModalInstance, monitoring, outcome, examiner, editMode, prerequisites, Outcome, Noncompliance, APIService) {

						$scope.item = outcome ? angular.copy(outcome) : new Outcome(monitoring, examiner);
						$scope.item.monitoring = {
							id: monitoring.id
						};
						$scope.editMode = editMode;
						$scope.noncompliances = null;
						$scope.prerequisites = prerequisites ? prerequisites : null;

						$scope.onFileUploaded = function () {
							$log.info("onFileUploaded:", $scope.item.attachment);
						};

						$scope.save = function (form) {

							if (!form.$valid) {
								$log.error("Invalid form!");
								return;
							}

							$scope.loader = true;

							var attachment = $scope.item.attachment ? $scope.item.attachment : null;
							delete $scope.item.attachment;

							if ($scope.item.id == null) {

								$log.info("Creating Outcome: %O", $scope.item);
								APIService.createOutcome($scope.item).then(
									function success(item) {

										if (attachment) {

											attachment.context = {
												id: item.context.id
											};

											$log.info("Updating Attachment: %O", attachment);
											APIService.updateAttachment(attachment).then(
												function success() {

													$uibModalInstance.close(item);

												})

										} else {

											$uibModalInstance.close(item);

										}

									}, savingError);

							} // else {
							//
							//     $log.info("Updating Outcome: %O", $scope.item);
							//     APIService.updateOutcome($scope.item).then(
							//         function success(outcome) {
							//
							//             console.log(outcome);
							//
							//             var currentAttachment = currentAttachments.find(function (a) {
							//                 return a.context.id == $scope.item.context.id;
							//             });
							//
							//             if (currentAttachment) {
							//
							//                 if (attachment) {
							//
							//                     if (currentAttachment.id == attachment.id) {
							//
							//                         $uibModalInstance.close(outcome);
							//
							//                     } else {
							//
							//                         $log.info("Deleting Attachment: %O", currentAttachment);
							//                         APIService.deleteAttachment(currentAttachment.id).then(
							//                             function success() {
							//
							//                                 attachment.context = {
							//                                     id: outcome.context.id
							//                                 };
							//
							//                                 $log.info("Updating Attachment: %O", attachment);
							//                                 APIService.updateAttachment(attachment).then(
							//                                     function success() {
							//
							//                                         $uibModalInstance.close(outcome);
							//
							//                                     })
							//
							//                             })
							//
							//                     }
							//
							//                 } else {
							//
							//                     $log.info("Deleting Attachment: %O", currentAttachment);
							//                     APIService.deleteAttachment(currentAttachment.id).then(
							//                         function success() {
							//
							//                             $uibModalInstance.close(outcome);
							//
							//                         })
							//
							//                 }
							//
							//             } else {
							//
							//                 if (attachment) {
							//
							//                     attachment.context = {
							//                         id: outcome.context.id
							//                     };
							//
							//                     $log.info("Updating Attachment: %O", attachment);
							//                     APIService.updateAttachment(attachment).then(
							//                         function success() {
							//
							//                             $uibModalInstance.close(outcome);
							//
							//                         })
							//
							//                 } else {
							//
							//                     $uibModalInstance.close(outcome);
							//
							//                 }
							//
							//             }
							//
							//         }, savingError
							//     );
							//
							// }

						};

						$scope.cancel = function () {
							$uibModalInstance.dismiss();
						};

						function savingError() {
							$scope.loader = false;
							$scope.errorMessage = "Saving data error!";
						}

						/*
						 $scope.isValid = function() {
						 return $scope.item.attachment == null || $scope.item.attachment.fileSize < 102400;
						 };
						 */
						$scope.addNoncompliance = function (item) {

							if (item.id == null){

								ModalService.dialogConfirm($translate.instant("notify.success"), 'alertMessage.wantToCreateOutcome',
									function onConfirmAction() {

										var attachment = $scope.item.attachment ? $scope.item.attachment : null;
										delete $scope.item.attachment;

										$log.info("Creating Outcome: %O", $scope.item);
										return APIService.createOutcome($scope.item).then(
											function success(item) {

												$scope.item = item;

												if (attachment) {

													attachment.context = {
														id: item.context.id
													};

													$log.info("Updating Attachment: %O", attachment);
													return APIService.updateAttachment(attachment).then(
														function success() {

															nonCompliance();

														})

												} else {

													nonCompliance();

												}

											}, savingError);

									}).then();

							} else {

								nonCompliance();

							}

							function nonCompliance(){

								var modalInstance = $uibModal.open({
									templateUrl: 'views/noncompliance/templates/noncompliance.detail.tmpl.html',
									size: 'lg',
									backdrop: 'static',
									resolve: {
										processCheck: function () {
											return null;
										},
										systemCheckRequirement: function () {
											return null;
										},
										noncompliance: function () {

											var obj = null;
											if($scope.noncompliances){
												obj = $scope.noncompliances.find(function (n) {
													return n.context && n.context.id == monitoring.context.id &&
														n.closeDate == null;
												});
											}


											if (obj == null) {
												obj = new Noncompliance();
												obj.context = monitoring.context;
											}
											return obj;
										},
										editMode: function () {
											return null;
										},
										prerequisites: function() {
											return $scope.prerequisites;
										}
									},
									controller: 'NoncomplianceDetailCtrl'
								});

								modalInstance.result.then(
									function confirm() {

										loadNonCompliances(true);

										$scope.$emit('Noncompliance-update');
									}, function dismiss() {
										$log.info('Modal dismissed at: ' + new Date());
									});

							}


						};

						function loadNonCompliances(result) {

							if($scope.prerequisites != null){

								APIService.getNoncompliancesByOrganizationId(ResourceService.getSelectedOrganization().id).then(
									function successCallback(data) {
										$log.info("NonCompliances: %O", data);
										$scope.noncompliances = data;

										if (result){

											$uibModalInstance.close();
										}

									});

							}

						}

						loadNonCompliances();
					}]
			});

			modalInstance.result.then(
				function confirm(item) {

					if ($scope.outcomes == null) {
						$scope.outcomes = [];
					}

					$scope.outcomes.push(item);

					init();

				}, function dismiss() {
					$log.info('Modal dismissed at: ' + new Date());
				});
		}

		function getObjectOfControl(monitoring) {
			if (!monitoring) {
				return null;
			}

			if (monitoring.context.className === "FlowElement") {

				if ($scope.isccp || $scope.isoprp){
					var entity = $scope.entities.find(function (entity) {
						if (entity.context != null) {
							return entity.context.id === monitoring.context.id;
						}
					});
					monitoring.context.subject = '[' + entity.type + '] ' + entity.name;
					return '[' + entity.type + '] ' + entity.name;
				}

			} else {
				var pr = $scope.prerequisites.find(function (p) {
					return p.prerequisiteType.id == monitoring.procedure.prerequisiteType.id &&
						p.context.id == monitoring.context.id;
				});


				if (pr) {
					if (monitoring.procedure.prerequisiteType.name == PrerequisiteType.STAFF_HYGIENE) {
						var userRole = $scope.userRoles.find(function (r) {
							return r.id == pr.role.id;
						});
						return userRole.name;
					} else {
						return pr.name;
					}
				}
			}

		}

		function loadPrerequisites() {

			return $q(function (resolve, reject) {

				var items = [];

				APIService.getAllPrerequisitesByOrganizationId().then(
					function successCallback(data) {

						items = data || [];

						APIService.getDiagramsByOrganizationId($scope.selectedOrganization.id).then(
							function (data) {

								$scope.diagrams = data;
								$log.info("Diagrams: %O", $scope.diagrams);

								var diagramIds = $scope.diagrams.map(function (diagram) {
									return diagram.id;
								});

								APIService.recursiveCall(diagramIds, APIService.getEntitiesByDiagramId).then(
									function (data) {

										$scope.entities = data;
										$log.info("Entities: %O", $scope.entities);

										resolve(items);
									});

							});
					});

			});

		}

		function checkPrerequisiteType(prerequisiteType, monitoringContext) {
			if ($scope.isccp === true) {

				var entity = $scope.entities.find(function ( entity ) {
					return entity.context && entity.context.id === monitoringContext.id;
				});
				// return prerequisiteType.name == PrerequisiteType.DANGER; <-- da quel che ho capito non serve più vedere i danger...

				return entity && entity.typeCCP && entity.typeCCP === Entity.CCPTYPES.CCP;

			} else if ($scope.isoprp === true) {

				var entity = $scope.entities.find(function ( entity ) {
					return entity.context && entity.context.id === monitoringContext.id;
				});

				return entity && entity.typeCCP && entity.typeCCP === Entity.CCPTYPES.OPRP;
			} else {
				var entity = $scope.entities.find(function ( entity ) {
					return entity.context && entity.context.id === monitoringContext.id;
				});

				if (entity) {

				} else {
					return prerequisiteType.name != PrerequisiteType.DANGER;
				}
			}
		};


		$scope.justOnceFilter = function(item) {
			return item.frequency.justOnce;
		}

		$scope.emptyOutcomesFilter = function(item) {
			if($scope.history.justOnce ) {
				return false;
			}

			return !item.outcomes || item.outcomes.length == 0;
		}


		function init() {

			var items = [];

			$scope.loader = true;

			APIService.getMonitoringsByRoleId($scope.isAdmin ? null : currentUser.role.id, currentUser.organization.id).then(
				function success(data) {

					var tasks = data.filter(function(t){
						if($scope.isccp) {
							return t.procedure.prerequisiteType.name == PrerequisiteType.CCP;
						}

						else if($scope.isoprp) {
							return t.procedure.prerequisiteType.name == PrerequisiteType.OPRP;
						}
						else {
							return t.procedure.prerequisiteType.name != PrerequisiteType.OPRP &&
								t.procedure.prerequisiteType.name != PrerequisiteType.CCP
						}
					});

					// extract unique contextIds and fetch relate prerequisites
					var contexts = $filter('unique')(tasks.map(function(t){ return t.context; }), 'id');

					APIService.recursiveCall(contexts, APIService.getPrerequisiteByContext).then(
						function success(data) {
							tasks.forEach(function (task) {
								if (!task.frequency.justOnce && !task.frequency.asNeeded && task.outcomes && task.outcomes[0]) {
									task.dueDate = $scope.getDueDate(task.frequency, task.outcomes[0].updateTime || task.outcomes[0].insertTime);
								}
								task.prerequisite = data.find(function(p){
									return p.context && task.context && p.context.id == task.context.id;
								});;
							});

							$scope.tasks = tasks;
						}
					).finally(function() {
						$scope.loader = false;
					});
				}
			);

			return;




			loadPrerequisites().then(
				function success(data) {
					$log.info("Prerequisites: %O", data);
					$scope.prerequisites = data;

					APIService.getRolesByOrganizationId($scope.selectedOrganization.id).then(
						function successCallback(data) {
							$log.info("Roles: %O", data);
							$scope.userRoles = data;

							APIService.getUsersByOrganizationId($scope.selectedOrganization.id).then(
								function successCallback(data) {
									$log.info("Users: %O", data);
									$scope.people = data;

									APIService.getProceduresByOrganizationId($scope.selectedOrganization.id).then(
										function successCallback(data) {

											if (data) {
												if ($scope.isAdmin || $scope.isVerifier) {
													$scope.procedures = data;
												}
												else {
													$scope.procedures = data.filter(function (procedure) {
														return procedure.userRole && procedure.userRole.id == currentUser.role.id;
													});
												}

												$log.info("Procedures: %O", $scope.procedures);

												if ($scope.isAdmin || $scope.isVerifier) {
													APIService.getMonitoringsByOrganizationId($scope.selectedOrganization.id).then(
														function successCallback(data) {

															if (data) {

																var proceduresIds = $scope.procedures.map(function (procedure) {
																	return procedure.id;
																});

																items = data.filter(function (monitoring) {
																	return proceduresIds.indexOf(monitoring.procedure.id) != -1
																		&& checkPrerequisiteType(monitoring.frequency.prerequisiteType, monitoring.context);
																});

																var monitoringIds = items.map(function (monitoring) {
																	return monitoring.id;
																});

																APIService.recursiveCall(monitoringIds, APIService.getOutcomeByMonitoringId).then(
																	function success(data) {

																		if (data) {

																			var outcomes = data.filter(function (o) {
																				return o.id != null;
																			});

																			outcomes.filter(function (o) {
																				return monitoringIds.indexOf(o.monitoring.id) != -1;
																			});

																			var contextIds = outcomes.filter(function (o) {
																				return o.context.id != null;
																			}).map(function (o) {
																				return o.context.id
																			});

																			APIService.recursiveCall(contextIds, APIService.getAttachmentsByContextId).then(
																				function success(data) {

																					currentAttachments = data;
																					$log.info("Attachments: %O", currentAttachments);

																					outcomes.forEach(function (outcome) {
																						outcome.attachment = data.find(function (a) {
																							return a.context.id == outcome.context.id;
																						})
																					});

																					$scope.outcomes = outcomes;
																					$log.info("Outcomes: %O", $scope.outcomes);

																					items.forEach(function (m) {
																						var outcomes = $scope.outcomes.filter(function (o) {
																							if (o.monitoring) {
																								return o.monitoring.id == m.id;
																							}
																						});

																						outcomes.sort(function (a, b) {
																							return a.insertTime - b.insertTime;
																						});

																						m.dueDate = $scope.getDueDate(m.frequency,
																							outcomes[0] ?
																								outcomes[0].updateTime ?
																									outcomes[0].updateTime :
																									outcomes[0].insertTime
																								: null);


																						m.objectOfControl = getObjectOfControl(m);

																					});

																					$scope.items = items.sort(function (a, b) {
																						return a.dueDate - b.dueDate;
																					});

																					$log.info("Monitorings: %O", items);

																					$scope.loader = false;

																				}
																			);
																		}
																	}
																);
															}
														}
													);
												} else {
													while(stop) {}
													APIService.getMonitoringsByRoleId(currentUser.role.id).then(
														function successCallback(data) {

															if (data) {

																var proceduresIds = $scope.procedures.map(function (procedure) {
																	return procedure.id;
																});

																items = data.filter(function (monitoring) {
																	return proceduresIds.indexOf(monitoring.procedure.id) != -1
																		&& checkPrerequisiteType(monitoring.frequency.prerequisiteType, monitoring.context);
																});

																var monitoringIds = items.map(function (monitoring) {
																	return monitoring.id;
																});

																APIService.recursiveCall(monitoringIds, APIService.getOutcomeByMonitoringId).then(
																	function success(data) {

																		if (data) {

																			var outcomes = data.filter(function (o) {
																				return o.id != null;
																			});

																			outcomes.filter(function (o) {
																				return monitoringIds.indexOf(o.monitoring.id) != -1;
																			});

																			var contextIds = outcomes.filter(function (o) {
																				return o.context.id != null;
																			}).map(function (o) {
																				return o.context.id
																			});

																			APIService.recursiveCall(contextIds, APIService.getAttachmentsByContextId).then(
																				function success(data) {

																					currentAttachments = data;
																					$log.info("Attachments: %O", currentAttachments);

																					outcomes.forEach(function (outcome) {
																						outcome.attachment = data.find(function (a) {
																							return a.context.id == outcome.context.id;
																						})
																					});

																					$scope.outcomes = outcomes;
																					$log.info("Outcomes: %O", $scope.outcomes);


																					items.forEach(function (m) {
																						var outcomes = $scope.outcomes.filter(function (o) {
																							if (o.monitoring) {
																								return o.monitoring.id == m.id;
																							}
																						});

																						outcomes.sort(function (a, b) {
																							return a.insertTime - b.insertTime;
																						});

																						m.dueDate = $scope.getDueDate(m.frequency,
																							outcomes[0] ?
																								outcomes[0].updateTime ?
																									outcomes[0].updateTime :
																									outcomes[0].insertTime
																								: null);


																						m.objectOfControl = getObjectOfControl(m);

																					});

																					$scope.items = items.sort(function (a, b) {
																						return a.dueDate - b.dueDate;
																					});

																					$log.info("Monitorings: %O", items);

																					$scope.loader = false;
																				}
																			);
																		}
																	}
																);
															}
														}
													);

												}


											}
										}
									);
								}
							);
						}
					);
				}
			);
		}

		init();
	});
