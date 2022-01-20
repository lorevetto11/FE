'use strict';

angular.module('APP').controller('FloorCtrl', floorCtrl);

function floorCtrl($scope, $state, $translate, $q, $uibModal, $log, $timeout, Command, Attachment,
                   Floor, currentUser, currentOrganization, ModalService, APIService, ResourceService, ValidationService, notify) {


    $scope.items = null;
    $scope.itemAdding;
    $scope.keywordFilter = null;

    $scope.selectedItem = null;
    $scope.originalSelectedItem = null;
    $scope.selectedOrganization = ResourceService.getSelectedOrganization();

    $scope.pattern = ValidationService.PATTERN;

    var MIME_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/bmp'];

    $scope.$on('resourceChange', function () {
        $scope.selectedOrganization = ResourceService.getSelectedOrganization();
        init();
    });

    $scope.isImage = function (attachment) {
        return attachment != null && (MIME_TYPES.indexOf(attachment.mimeType) != -1);
    };

    //logica di riconoscimento automatico delle dimensioni dell'immagine allegata
    $scope.$watch('selectedItem.backgroundImageAttachment', function (value) {


        if (value && value.data && $scope.isImage(value)) {

            $log.info("$watch backgroundImageAttachment:", value);


            $scope.selectedItem.width = 0;
            $scope.selectedItem.height = 0;

            var image = new Image();

            image.addEventListener("load", function () {
                $scope.selectedItem.width = image.width;
                $scope.selectedItem.height = image.height;

                $scope.$apply();
            });

            image.src = "data:" + value.mimeType + ";base64," + value.data;
        }
    });

    $scope.add = function () {

        $scope.selectedItem = null;

        $timeout(function () {
            $scope.selectedItem = new Floor();
            $scope.itemAdding = true;
        });
    };

    $scope.edit = function (item) {

        $scope.selectedItem = null;

        $timeout(function () {
            $scope.selectedItem = angular.copy(item);
            $scope.originalSelectedItem = angular.copy(item);
            $scope.itemAdding = null;
        });

    };

    $scope.cancel = function () {

        $scope.selectedItem = null;
        $scope.itemAdding = null;

    };

    $scope.delete = function (item) {

        ModalService.dialogConfirm(
            'Delete', 'Floor <strong>' + item.name + '</strong> will be deleted. May I proceed? ',

            function onConfirmAction() {

                return deleteFloor(item).then(
                    function success() {
                        init();
                        notify.logSuccess('Success', 'Floor successfully deleted!');
                    }, savingError);
            }
        ).then();
    };

    $scope.clone = function (item) {

        var clone = angular.copy(item);
        clone.id = null;
        clone.name = 'Copy of - ' + clone.name;

        $scope.selectedItem = clone;

    };



    function createFloor(item) {
        return $q(function (resolve, reject) {

            var attachment = item.backgroundImageAttachment ? new Attachment(item.backgroundImageAttachment.id) : null;
            item = Floor.parse(item);

            APIService.createFloor(item).then(
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
    };

    function updateFloor(item) {
        return $q(function (resolve, reject) {

            var attachment = item.backgroundImageAttachment ? new Attachment(item.backgroundImageAttachment.id) : null;
            item = Floor.parse(item);

            var original = $scope.originalSelectedItem.backgroundImageAttachment;

            // remove attachment ( even if it has been changed )
            if (original &&
                (!attachment || attachment.id != original.id)) {
                APIService.deleteAttachment(original.id);
            }

            APIService.updateFloor(item).then(
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
    };

    function deleteFloor(item) {
        return $q(function (resolve, reject) {
            APIService.deleteFloor(item.id).then(
                function success(data) {
                    if (item.backgroundImageAttachment) {
                        return APIService.deleteAttachment(item.backgroundImageAttachment.id).then(
                            function success(){
                                resolve(data);
                            }, reject);
                    } else {
                        resolve(data)
                    }
                }, reject);
        });
    };

    $scope.save = function (form, item) {

        if (form.$invalid) {
            ValidationService.dirtyForm(form);
            return;
        }

        if (item.id == null) {
            createFloor(item).then(
                function success(item) {

                    init();
                    $scope.edit(item);

                    notify.logSuccess('Success', 'New Floor successfully created!');
                }, savingError );

        } else {

            updateFloor(item).then(
                function success(item) {

                    init();
                    $scope.edit(item);

                    notify.logSuccess('Success', 'New Floor successfully updated!');
                }, savingError );

            /*
             if (item.backgroundImageAttachment) {

             item.backgroundImageAttachment.context = {
             id: item.context.id
             };

             APIService.getAttachmentsByContextId(item.context.id).then(
             function success(attachments) {

             var attachmentsId = attachments.map(function (item) {
             return item.id;
             });

             APIService.recursiveCall(attachmentsId, APIService.deleteAttachment).then(
             function success() {

             $log.info("Updating Attachment: %O", item.backgroundImageAttachment);
             APIService.updateAttachment(item.backgroundImageAttachment).then(
             function success() {

             delete item.backgroundImageAttachment;
             $log.info("Updating Floor: %O", item);
             APIService.updateFloor(item).then(
             function success(item) {

             init();

             notify.logSuccess('Success', 'Floor successfully updated');

             },
             savingError);
             },
             savingError);

             },
             savingError);

             },
             savingError);

             } else {

             APIService.updateFloor(item).then(
             function success(item) {
             init();
             $scope.selectedItem = item;
             notify.logSuccess('Success', 'Floor successfully updated');
             },
             savingError);
             }
             */
        }
    };

    $scope.itemsFilter = function (item) {
        var result = true;
        if ($scope.keywordFilter && $scope.keywordFilter.length > 0) {
            result &= (item.name && item.name.toLowerCase().indexOf($scope.keywordFilter.toLowerCase()) != -1) ||
                (item.description && item.description.toLowerCase().indexOf($scope.keywordFilter.toLowerCase()) != -1);
        }
        return result;
    };

    function savingError() {
        $scope.loader = false;
        $scope.errorMessage = "Saving data error!";
    }

    function init() {

        $scope.items = null;
        $scope.itemsLoading = true;
        $scope.itemAdding = null;

        $scope.selectedItem = null;

        if (!$scope.selectedOrganization) {
            $scope.itemsLoading = null;
            return;
        }

        APIService.getFloorsByOrganizationId($scope.selectedOrganization.id).then(
            function successCallback(data) {

                $scope.items = data;
                $log.info("Floors: %O", $scope.items);

                var contextIds = $scope.items.map(function (i) {
                    return i.context.id
                });

                APIService.recursiveCall(angular.copy(contextIds), APIService.getAttachmentsByContextId).then(
                    function success(data) {

                        $scope.items.forEach(function (item) {
                            item.backgroundImageAttachment = data.find(function (a) {
                                return a.context.id === item.context.id;
                            })
                        });
                        $scope.itemsLoading = null;
                    });
            });
    }

    init();

}