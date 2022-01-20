'use strict';
angular.module('APP')
	.controller('FlowsDiagramsCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
												Diagram,
	                                           ResourceService, APIService, ValidationService, ModalService) {


		$scope.items = null;

		$scope.loading = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		$scope.add = function() {

			showDiagram();

		};

		$scope.edit = function(item) {

			showDiagram(angular.copy(item));

		};

		function showDiagram(item) {

			var modalInstance = $uibModal.open({
				templateUrl: 'views/prerequisite/flows/templates/flow.diagram.detail.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					item: function () {
						return item ? item : new Diagram();
					},
					items: function () {
						return $scope.items;
					}
				},
				controller: ['$scope', '$uibModalInstance', 'item', 'items', 'APIService', 'ValidationService',
					function ($scope, $uibModalInstance, item, items, APIService, ValidationService) {

						$scope.item = item;
						$scope.items = items;

						$scope.save = function(item, form) {

							if(form.$invalid){
								ValidationService.dirtyForm(form);
								return false;
							}

							$scope.loading = true;

							if(item.id == null){

								createDiagram(item);

							} else {

								updateDiagram(item);

							}

							function createDiagram(item){

								APIService.createDiagram(item).then(
									function success(data){

										$scope.items.push(data);
										$scope.loading = false;

										$uibModalInstance.close($scope.items);

									}, savingError);

							}

							function updateDiagram(item){

								APIService.updateDiagram(item).then(
									function success(data){

										var index = $scope.items.indexOf($scope.items.find(function (item){
											return item.id == data.id
										}));

										if (index != -1) {

											$scope.items.splice(index, 1, data);
											$scope.loading = false;

										}

										$uibModalInstance.close($scope.items);

									}, savingError);

							}

						};


						$scope.cancel = function () {
							$uibModalInstance.dismiss();
						};

						function savingError() {
							$scope.loading = false;
							$scope.errorMessage = $translate.instant('notify.savingDataError');
						}

					}]

			});

			modalInstance.result.then(
				function confirm(items) {
					if (items != null) {
						$scope.items = items;
					}
				}, function dismiss() {
					$log.info('Modal dismissed at: ' + new Date());
				}
			);

		}

		$scope.delete = function (item) {

			ModalService.dialogConfirm("alertMessage.delete", $translate.instant("entity.diagram") + ' <strong> ' + item.name + '</strong> ' + $translate.instant("alertMessage.willBeDeleted"),
				function onConfirmAction() {

					return APIService.deleteDiagram(item.id).then(
						function success(){

							var index = $scope.items.indexOf(item);

							if (index != -1) {

								$scope.items.splice(index, 1);
								$scope.loading = false;

							}

							savingError();

						}, savingError);


				}
			).then(init);

		};

		function savingError() {

			$scope.loading = false;
			$scope.errorMessage = $translate.instant('notify.savingDataError');

		}

		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			APIService.getDiagramsByOrganizationId($scope.selectedOrganization.id).then(
				function success(data){

					$scope.items = data;
					$scope.loading = false;

				}, savingError);

		}

		init();

	});
