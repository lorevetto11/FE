'use strict';

angular.module('APP')
	.controller('TrainingCourseCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
	                                            Frequency, Course, currentUser, currentOrganization, Attachment, ModalService, APIService, ResourceService, StorageService, notify, ValidationService, UtilsService, PermissionService) {

		$scope.items = null;
		$scope.selectedItem = null;
		$scope.filter = {};
		$scope.frequencyScales = Frequency.PERIOD;

		$scope.selectedOrganization = null;

		$scope.loading = null;

		$scope.add = function () {
			$scope.selectedItem = new Course();
		};

		$scope.edit = function (item) {
			$scope.selectedItem = angular.copy(item);
			$scope.originalSelectedItem = angular.copy(item);
		};

		$scope.cancel = function () {
			$scope.selectedItem = null
		};

		$scope.delete = function (item) {

			ModalService.dialogConfirm("alertMessage.delete", '"entity.course" <strong> ' + item.name + '</strong> "alertMessage.willBeDeleted"',
				function onConfirmAction() {

					return APIService.getTrainingsByOrganizationId($scope.selectedOrganization.id).then(
						function success(data) {

							var trainingIds = data.filter(function (training) {
								return training.course.id == item.id;
							}).map(function (training) {
								return training.id;
							});

							if (trainingIds.length == 0) {

								return APIService.recursiveCall(trainingIds, APIService.deleteTraining).then(
									function success() {

										return deleteCourse(item);

									});

							} else {

								notify.logWarning($translate.instant('notify.warning'), $translate.instant('notify.cannotDeleteCourseWithLessons'));
								return false;

							}

						});

				}
			).then(init);

		};


		function createCourse(item) {
			return $q(function (resolve, reject) {

				var attachment = item.attachment ? new Attachment(item.attachment.id) : null;
				item = Course.parse(item);

				APIService.createCourse(item).then(
					function success(data) {
						if (attachment) {
							attachment.context = data.context;
							return APIService.updateAttachment(attachment).then(
								function success(attach) {
									data.attachment = attach;
									resolve(data);
								}, reject);
						} else {
							resolve(data)
						}
					}, reject);
			});
		}

		function updateCourse(item) {
			return $q(function (resolve, reject) {

				var attachment = item.attachment ? new Attachment(item.attachment.id) : null;
				item = Course.parse(item);

				var original = $scope.originalSelectedItem.attachment;

				// remove attachment ( even if it has been changed )
				if (original &&
					(!attachment || attachment.id != original.id)) {
					APIService.deleteAttachment(original.id);
				}

				APIService.updateCourse(item).then(
					function success(data) {

						if (attachment && data.context) {
							attachment.context = data.context;
							return APIService.updateAttachment(attachment).then(
								function success(attach) {
									data.attachment = attach;
									resolve(data);
								}, reject);
						} else {
							resolve(data);
						}
					}, reject);
			})
		}

		function deleteCourse(item) {
			return $q(function (resolve, reject) {
				APIService.deleteCourse(item.id).then(
					function success(data) {
						if (item.attachment) {
							return APIService.deleteAttachment(item.attachment.id).then(
								function success() {
									resolve(data);
								}, reject);
						} else {
							resolve(data)
						}
					}, reject);
			});
		}

		$scope.save = function (item) {

			if (form.$invalid) {
				ValidationService.dirtyForm(form);
				return false;
			}

			$scope.loading = true;

			if (item.id == null) {

				createCourse(item).then(
					function success(item) {

						init();
						$scope.edit(item);

						notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.courseCreated'));

					}, savingError);

				// APIService.createCourse(item).then(
				// 	function success(item) {
				//
				// 		$scope.selectedItem = item;
				//
				//
				// 	}, savingError);

			} else {

				updateCourse(item).then(
					function success(item) {

						init();

						$scope.edit(item);

						notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.courseCreated'));

					}, savingError);

				// APIService.updateCourse(item).then(
				// 	function success(item) {
				//
				// 		$scope.selectedItem = item;
				// 		notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.courseUpdated'));
				// 		init();
				//
				// 	}, savingError);

			}
		};

		$scope.isValid = function (item) {
			return item != null &&
				item.name != null
		};

		$scope.itemsFilter = function (item) {

			var result = true;
			
			if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
				var keyword = $scope.filter.keyword.toLowerCase();

				result &= (item.name && item.name.toLowerCase().indexOf(keyword) != -1) ||
					(item.description && item.description.toLowerCase().indexOf(keyword) != -1);
			}

			return result;
		};

		function savingError() {
			$scope.loader = false;
			$scope.errorMessage = $translate.instant('notify.savingDataError');
		}


		function init() {

			$scope.selectedItem = null;

			$scope.selectedOrganization = ResourceService.getSelectedOrganization();
			if ($scope.selectedOrganization == null) {
				return;
			}

			$scope.loading = true;

			APIService.getCoursesByOrganizationId($scope.selectedOrganization.id).then(
				function successCallback(data) {

					$log.info("Courses: %O", data);
					$scope.items = data;

					var contextIds = $scope.items.map(function (course) {
						return course.context.id;
					});

					APIService.recursiveCall(contextIds, APIService.getAttachmentsByContextId).then(
						function success(data) {

							data.forEach(function (attachment) {

								var course = $scope.items.find(function (course) {
									return course.context.id == attachment.context.id;
								});

								if (course) {

									var index = $scope.items.indexOf(course);

									$scope.items[index].attachment = attachment;

								}

							});

							$scope.loading = false;

						});

				});

		}

		init();

	});
