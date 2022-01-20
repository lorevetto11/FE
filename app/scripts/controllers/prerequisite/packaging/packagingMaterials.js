'use strict';

angular.module('APP')
	.controller('PackagingMaterialsCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
	                                                PackagingMaterial, MaterialCategory, Attachment,
	                                                APIService, ResourceService, ValidationService, ModalService) {
		$scope.prerequisites = null;
		$scope.audits = null;
		$scope.people = null;
		$scope.userRoles = null;
		$scope.trainings = null;
		$scope.items = [];
		$scope.originalSelectedItem = null;

		$scope.loading = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		$scope.delete = function(item){

			ModalService.dialogConfirm($translate.instant("alertMessage.delete"), $translate.instant("entity.material") + ' <strong> ' + item.name + '</strong> ' + $translate.instant("alertMessage.willBeDeleted"),
				function onConfirmAction() {

					$log.info("Deleting material: %O", item);
					return APIService.deleteMaterial(item.id);

				}
			).then(init);

		};

		$scope.viewSupplier = function (item) {

			var modalInstance = $uibModal.open({
				templateUrl: 'views/prerequisite/packaging/templates/packaging.material.supplier.detail.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					item: function () {
						return item;
					}
				},
				controller: ['$scope', '$uibModalInstance', '$translate', 'item',
					function ($scope, $uibModalInstance, $translate, item) {

						$scope.item = item;

						$scope.close = function () {
							$uibModalInstance.dismiss();
						};

						function init() {

						}

						init();

					}]
			});

		};

		$scope.add = function(item) {

			var modalInstance = $uibModal.open({
				templateUrl: 'views/prerequisite/packaging/templates/packaging.material.detail.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					item: function () {
						return item ? item : new PackagingMaterial();
					},
					selectedOrganization: function () {
						return $scope.selectedOrganization;
					},
					originalSelectedItem: function () {
						return $scope.originalSelectedItem;
					}
				},
				controller: ['$scope', '$uibModalInstance', '$translate', 'item', 'selectedOrganization', 'originalSelectedItem', 'APIService', 'ValidationService',
					function ($scope, $uibModalInstance, $translate, item, selectedOrganization, originalSelectedItem, APIService, ValidationService) {

						$scope.item = item;
						$scope.item.type = $scope.item.type ? $scope.item.type : PackagingMaterial.TYPES.PACKAGING;
						$scope.categories = null;
						$scope.suppliers = null;
						$scope.originalSelectedItem = originalSelectedItem;

						function createMaterial(item) {
							return $q(function (resolve, reject) {

								var attachment = item.attachment ? new Attachment(item.attachment.id) : null;
								item = PackagingMaterial.parse(item);

								APIService.createMaterial(item).then(
									function success(data) {
										if (attachment) {
											attachment.context = data.context;
											return APIService.updateAttachment(attachment).then(
												function success(){
													resolve(data);
												}, reject);
										} else {
											resolve(data)
										}
									}, reject);
							});
						}

						function updateMaterial(item) {
							return $q(function (resolve, reject) {

								var attachment = item.attachment ? new Attachment(item.attachment.id) : null;
								item = PackagingMaterial.parse(item);

								var original = $scope.originalSelectedItem.attachment;

								// remove attachment ( even if it has been changed )
								if (original &&
									(!attachment || attachment.id != original.id)) {
									APIService.deleteAttachment(original.id);
								}

								APIService.updateMaterial(item).then(
									function success(data) {
										if (attachment && data.context) {
											attachment.context = data.context;
											return APIService.updateAttachment(attachment).then(
												function success(){
													resolve(data);
												}, reject);
										} else {
											resolve(data);
										}
									}, reject);
							})
						}

						$scope.save = function(form) {

							if(form.$invalid){
								ValidationService.dirtyForm(form);
								return false;
							}

							if($scope.item.id == null){

								createMaterial($scope.item).then(
									function success(){

										$uibModalInstance.close();

									});

							} else {

								updateMaterial($scope.item).then(
									function success(){

										$uibModalInstance.close();

									});

							}

						};

						$scope.close = function () {
							$uibModalInstance.dismiss();
						};

						function init() {
							
							$scope.loading = true;

							APIService.getSuppliersByOrganizationId(selectedOrganization.id).then(
								function success(data){

									$scope.suppliers = data;
									$log.info("Suppliers: %O", data);

									APIService.getMaterialCategoriesByOrganizationId(selectedOrganization.id).then(
										function success(data){

											$scope.categories = data.filter(function(category){
												return category.type == MaterialCategory.TYPES.PACKAGING;
											});
											$log.info("Categories: %O", $scope.categories);

											$scope.loading = false;

										});

								});

						}

						init();

					}]
			});

			modalInstance.result.then(
				function confirm(item) {

					init();

				}, function dismiss() {
					$log.info('Modal dismissed at: ' + new Date());
				});

		};

		$scope.edit = function(item){

			$scope.originalSelectedItem = angular.copy(item);
			$scope.add(item);

		};

		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			APIService.getMaterialsByOrganizationId($scope.selectedOrganization.id).then(
				function (data) {

					$scope.items = data.filter(function(material){
						return material.type == PackagingMaterial.TYPES.PACKAGING;
					});
					$log.info("Materials: %O", $scope.items);

					var contextIds = $scope.items.map(function(material){
						return material.context.id;
					}).filter(function(id){
						return id != null;
					});

					APIService.recursiveCall(contextIds, APIService.getAttachmentsByContextId).then(
						function success(data){
							$scope.items.forEach(function (material) {
								material.attachment = data.find(function (attachment) {
									return material.context.id == attachment.context.id;
								}) || null;
							});
						});

					$scope.loading = false;

				});
		}

		init();

	});
