'use strict';

angular.module('APP')
	.controller('TrainingLessonCtrl', function ($rootScope, $scope, $state, $translate, $q, $uibModal, $log, Frequency,
	                                            Training, currentUser, currentOrganization, ModalService, APIService, ResourceService, ValidationService, StorageService, notify, UtilsService, PermissionService) {

		$scope.items = null;
		$scope.courses = null;
		$scope.userRoles = null;
		$scope.users = null;
		$scope.participants = null;

		$scope.currentPage = 0;

		$scope.selectedOrganization = null;
		$scope.loading = null;

		var filter = ResourceService.getFilter() || {};
		$scope.filter = filter.training || {};
		$scope.filteredItems = [];

		$scope.add = function () {
			showDetailModal(new Training(), true);
		};

		$scope.edit = function (item) {
			showDetailModal(item, true);
		};

		$scope.view = function (item) {
			showDetailModal(item, false);
		};

		$scope.delete = function (item) {

			var course = $scope.courses.find(function (c) {
				return c.id == item.course.id;
			});

			ModalService.dialogConfirm("alertMessage.delete", '"entity.lesson" <strong> ' + course.title + '</strong> "alertMessage.willBeDeleted"',
				function onConfirmAction() {
					return APIService.deleteTraining(item.id);
				}
			).then(loadTrainings);

		};


		$scope.onPageChanged = function (page) {
			$scope.currentPage = page;
		};

		function showDetailModal(item, editMode) {

			var isNew = (item.id == null);

			var modalInstance = $uibModal.open({
					templateUrl: 'views/training/lesson/training.lesson.detail.tmpl.html',
					size: 'lg',
					backdrop: 'static',
					resolve: {
						item: function () {
							return item;
						},
						courses: function () {
							return $scope.courses;
						},
						userRoles: function () {
							return $scope.userRoles;
						},
						users: function () {
							return $scope.users;
						},
						editMode: function () {
							return editMode != null ? editMode : false;
						},
						participants: function () {
							return $scope.participants;
						}
					},
					controller: ['$scope', '$uibModalInstance', 'item', 'courses', 'userRoles', 'users', 'editMode', 'participants', 'Training', 'Participant', 'Attachment', 'notify', 'APIService', 'ValidationService',
						function ($scope, $uibModalInstance, item, courses, userRoles, users, editMode, participants, Training, Participant, Attachment, notify, APIService, ValidationService) {

							$scope.editMode = editMode;
							$scope.originalItem = item;
							$scope.item = angular.copy(item);
							$scope.courses = courses;
							$scope.userRoles = userRoles;
							$scope.users = users;
							$scope.participants = participants;

							function createTraining(item) {
								return $q(function (resolve, reject) {

									var participants = item.participants;

									item.participants = item.participants.map(function (p) {
										return Participant.parse(p);
									});

									return APIService.createTraining(item).then(
										function success(data) {

											if (participants) {

												var attachments = participants.map(function (participant) {

													if (participant.attachment) {

														participant.attachment.user = participant.user;

													}

													return participant.attachment;

												}).filter(function (a) {

													return a != null;

												});

												if (attachments) {

													attachments = attachments.map(function (attachment) {

														var context = data.participants.find(function (participant) {
															return participant.user.id == attachment.user.id;
														}).context;

														attachment.context = context;

														attachment = Attachment.parse(attachment);

														return attachment;

													});

													return APIService.recursiveCall(attachments, APIService.updateAttachment).then(
														function success() {
															resolve(data);
														}, reject);

												} else {
													resolve(data)
												}

											} else {
												resolve(data)
											}

										}, reject);
								});
							}

							function updateTraining(item) {

								return $q(function (resolve, reject) {

									var originalParticipants = $scope.originalItem.participants;

									var contextIds = originalParticipants.map(function (p) {
										return p.context.id;
									});

									APIService.recursiveCall(contextIds, APIService.getAttachmentsByContextId).then(
										function success(attachments) {

											var attachmentIds = attachments.map(function (a) {
												return a.id;
											});

											APIService.recursiveCall(attachmentIds, APIService.deleteAttachment).then(
												function success() {

													var participants = item.participants;

													item.participants = item.participants.map(function (p) {
														return Participant.parse(p);
													});

													APIService.updateTraining(item).then(
														function success(data) {

															if (participants) {

																var attachments = participants.map(function (participant) {

																	if (participant.attachment) {

																		participant.attachment.user = participant.user;

																	}

																	return participant.attachment;

																}).filter(function (a) {

																	return a != null;

																});

																if (attachments) {

																	attachments = attachments.map(function (attachment) {

																		var context = data.participants.find(function (participant) {
																			return participant.user.id == attachment.user.id;
																		}).context;

																		attachment.context = context;

																		attachment = Attachment.parse(attachment);

																		return attachment;

																	});

																	return APIService.recursiveCall(attachments, APIService.updateAttachment).then(
																		function success() {
																			resolve(data);
																		}, reject);

																} else {
																	resolve(data)
																}

															} else {
																resolve(data)
															}

														});

												}, savingError);

										}, savingError);

								})

							}

							$scope.save = function (form) {

								if (form.$invalid) {
									ValidationService.dirtyForm(form);
									return false;
								}

								$scope.loading = true;

								if ($scope.item.id == null) {

									$log.info("Creating Training: %O", $scope.item);
									createTraining($scope.item).then(
										function success(item) {

											$uibModalInstance.close(item);
											notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.lessonCreated'));

										}, savingError);


								} else {


									$log.info("Update Training: %O", $scope.item);
									updateTraining($scope.item).then(
										function success(item) {

											$uibModalInstance.close(item);
											notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.lessonUpdated'));

										}, savingError);

								}

							};

							$scope.cancel = function () {
								$uibModalInstance.dismiss();
							};

							$scope.archiveTraining = function (training) {
								training.archived = true;
							};

							$scope.isParticipant = function (user) {
								if ($scope.item.participants) {
									return ($scope.item.participants.find(function (p) {
										return p.user.id == user.id;
									}) != null);
								}
								return false;
							};

							$scope.isPassedExam = function (user) {
								if ($scope.item.participants) {
									return $scope.item.participants.find(function (p) {
										return p.user.id == user.id && p.passed == true;
									});
								}
								return false;
							};

							$scope.checkParticipant = function (user, update) {

								if (user) {

									var participant = $scope.item.participants.find(function (p) {
										return p.user.id == user.id;
									});

									var idx = $scope.item.participants.indexOf(participant);

									if (idx != -1) {

										$scope.item.participants.splice(idx, 1);

									} else {

										$scope.item.participants.push(new Participant(user.id));

									}
									// if ($scope.item.participants == null) {
									//     $scope.item.participants = [];
									// }
									//
									// var participant = $scope.originalItem.participants.find(function (p) {
									//     return p.user.id == user.id;
									// });
									// console.log($scope.originalItem.participants);
									// var idx = $scope.item.participants.indexOf(participant);
									// console.log(idx);
									// if (idx != -1) {
									//     $scope.item.participants.splice(idx, 1);
									// } else {
									//     if (update) {
									//         $scope.item.participants.push(participant);
									//     } else {
									//         $scope.item.participants.push(new Participant(user.id));
									//     }
									// }
								}

							};

							$scope.checkPassedExam = function (user) {
								if (user) {
									var participant = $scope.item.participants.find(function (p) {
										return p.user.id == user.id;
									});

									if (participant) {
										if (participant.passed == null) {
											participant.passed = true;
										} else {
											participant.passed = !participant.passed;
										}
									}
								}
							};

							$scope.getPartecipant = function (user) {

								if ($scope.item.participants) {
									return $scope.item.participants.find(function (p) {
										return p.user.id == user.id;
									});
								}
							};

							function savingError() {
								$scope.loading = false;
								$scope.errorMessage = $translate.instant('notify.savingDataError');
							}

							function initialize() {

								var participants = item.participants.map(function (participant) {
									return $scope.participants.find(function (p) {
										return p.id == participant.id;
									});
								});

								$scope.item.participants = participants;
								$scope.originalItem.participants = participants;

							}

							initialize();

							$scope.additionalInformationModal = function (item) {

								var modalInstance = $uibModal.open({
									templateUrl: 'views/training/lesson/training.lesson.participant.detail.tmpl.html',
									size: 'lg',
									backdrop: 'static',
									resolve: {
										item: function () {
											return $scope.item;
										},
										editMode: function () {
											return editMode != null ? editMode : false;
										},
										user: function () {
											return $scope.getPartecipant(item);
										}
									},
									controller: ['$scope', '$uibModalInstance', 'item', 'user', 'editMode', 'Training', 'Participant', 'Attachment', 'notify', 'APIService', 'ValidationService',
										function ($scope, $uibModalInstance, item, user, editMode, Attachment, Training, Participant, notify, APIService, ValidationService) {

											$scope.editMode = editMode;
											$scope.originalItem = item;
											$scope.item = angular.copy(item);
											$scope.users = users;
											$scope.user = user;

											$scope.cancel = function () {
												$uibModalInstance.dismiss();
											};

											$scope.save = function () {

												$uibModalInstance.close($scope.user);

											};

											function initi() {

												$scope.loading = true;

												if ($scope.user.context) {

													APIService.getAttachmentsByContextId($scope.user.context.id).then(
														function success(data) {

															$scope.user.attachment = data[0];

															$scope.loading = false;

														});

												} else {

													$scope.loading = false;

												}

											}

											initi();

											function savingError() {
												$scope.loading = false;
												$scope.errorMessage = $translate.instant('notify.savingDataError');
											}

										}]
								});

								modalInstance.result.then(
									function confirm(item) {

										var participant = $scope.item.participants.find(function (participant) {
											return participant.user.id == item.id
										});

										if (participant) {

											var index = $scope.item.participants.indexOf(participant);

											$scope.item.participants[index] = Participant.parse(item);

										}

									}, function dismiss() {

									});
							}

						}
					]
				})
				;

			modalInstance.result.then(
				function confirm(item) {
					$scope.loading = true;
					loadTrainings();
				}, function dismiss() {

				});
		}

		$scope.showCourseDetail = function (course) {

			$uibModal.open({
				templateUrl: 'views/training/course/training.course.detail.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					item: function () {
						return course;
					}
				},
				controller: ['$scope', '$uibModalInstance', 'item', 'Training', 'Participant', 'notify', 'APIService',
					function ($scope, $uibModalInstance, item, Training, Participant, notify, APIService) {
						$scope.item = item;

						$scope.cancel = function () {
							$uibModalInstance.dismiss();
						};

					}]

			})

		};

		$scope.setFilter = function () {

			filter.training = $scope.filter;

			ResourceService.setFilter(filter);

			$rootScope.$broadcast('filtersChanged');

		};

		$scope.itemsFilter = function (item) {

			var result = true;

			if ($scope.filter.archived != null) {
				if ($scope.filter.archived == true) {
					result &= item.archived == true;
				} else {
					result &= item.archived == false;
				}
			}

			var originalItem = $scope.filteredItems.find(function (oItem) {
				return oItem.id == item.id;
			});

			if (result) {

				if (!originalItem) {

					$scope.filteredItems.push(item);

				}

			} else {

				if (originalItem) {

					var index = $scope.filteredItems.indexOf(originalItem);

					$scope.filteredItems.splice(index, 1);

				}

			}

			return result;

		};


		function loadTrainings() {

			APIService.getParticipantsByOrganizationId($scope.selectedOrganization.id).then(
				function successCallback(data) {

					$scope.participants = data;
					$log.info("Participants: %O", $scope.participants);

					APIService.getTrainingsByOrganizationId($scope.selectedOrganization.id).then(
						function successCallback(data) {

							$scope.items = data;
							$log.info("Trainings: %O", $scope.items);

							$scope.loading = false;

						});

				});

		}

		function init() {

			$scope.selectedOrganization = ResourceService.getSelectedOrganization();
			if ($scope.selectedOrganization == null) {
				return;
			}

			$scope.loading = true;

			APIService.getCoursesByOrganizationId($scope.selectedOrganization.id).then(
				function successCallback(data) {

					$scope.courses = data;
					$log.info("Courses: %O", $scope.courses);

					if ($scope.courses.length > 0) {
						APIService.getRolesByOrganizationId($scope.selectedOrganization.id).then(
							function successCallback(data) {

								$scope.userRoles = data;
								$log.info("Roles: %O", $scope.userRoles);

								APIService.getUsersByOrganizationId($scope.selectedOrganization.id).then(
									function successCallback(data) {

										$scope.users = data;
										$log.info("Users: %O", $scope.users);

										loadTrainings();

									});

							});

					}

				});

		}

		init();

	})
;
