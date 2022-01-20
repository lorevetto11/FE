'use strict';

/**
 * @ngdoc function
 * @name APP.services:UtilityService
 * @description
 * # StorageService
 * Utility Service wrapping common methods of the APP
 */
angular.module('APP')
        .factory('ModalService', ['$resource', '$rootScope', '$uibModal', '$q', 'APIService', 'moment', 'ENV',
                    function ($resource, $rootScope, $uibModal, $q, APIService, moment, ENV) {
                //INTERNAL METHODS
                var _dialogConfirm = function (_title, _message, _onConfirmAction) {
                    return $q(function(resolve, reject){
                        var modalInstance = $uibModal.open({
                            templateUrl: 'views/common/templates/dialogs/modalConfirm.tmpl.html',
                            controller: 'DialogConfirmCtrl',
                            resolve: {
                                title : function() { return _title; },
                                message : function() { return _message; },
                                onConfirmAction: function() { return _onConfirmAction; },
                            }
                        });
                        modalInstance.result.then(resolve, reject);
                    });
                };

                var _dialogAlert = function (_title, _message, _onConfirmAction) {
                    return $q(function(resolve, reject){
                        var modalInstance = $uibModal.open({
                            templateUrl: 'views/common/templates/dialogs/modalAlert.tmpl.html',
                            controller: 'DialogConfirmCtrl',
                            resolve: {
                                title : function() { return _title; },
                                message : function() { return _message; },
                                onConfirmAction: function() { return _onConfirmAction; },
                            }
                        });
                        modalInstance.result.then(resolve, reject);
                    });
                };

                var _dialogPerform = function (title, message) {
                    var modalInstance = $uibModal.open({
                        backdrop: 'static',
                        templateUrl: 'views/common/templates/dialogs/modalPerform.tmpl.html',
                        controller: 'DialogPerformCtrl'
                    });

                    modalInstance.title = title;
                    modalInstance.message = message;

                    var _close = function () {
                        if (modalInstance != null) {
                            modalInstance.close();
                        }
                    };

                    return {
                        close: _close
                    };
                };

                var _dialogSuccess = function (message, onClose) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'views/common/templates/dialogs/modalAlert.tmpl.html',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.message = message;

                            $scope.ok = function () {

                                $uibModalInstance.close();

                                if (typeof onClose == 'function')
                                    onClose();
                            };
                        }
                    });

                    if (typeof onClose == 'function') {
                        modalInstance.result.then(onClose, onClose);
                    }

                    setTimeout(function () {
                        if (modalInstance != null)
                            modalInstance.close();
                    }, 3000);
                };

                var _addBookingModal = function (onConfirm) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'views/manage/survey-admiinistration/addBookingModal.tmpl.html',
                        controller: 'BookingModalCtrl'
                    });
                    modalInstance.onConfirm = onConfirm;
                };

                var _editTaskModal = function (task, taskList, roles, attachmentTypes, taskRoleTypes, onCreate, onUpdate, onDelete) {
                    var modalInstance = $uibModal.open({
                        size: 'lg',
                        templateUrl: 'views/main/gantt/taskModal.tmpl.html',
                        controller: 'TaskModalCtrl'
                    });
                    modalInstance.task = angular.copy(task);
                    modalInstance.taskList = taskList;
                    modalInstance.roles = roles;
                    modalInstance.originalRoles = JSON.stringify(roles);
                    modalInstance.attachmentTypes = attachmentTypes;
                    modalInstance.taskRoleTypes = taskRoleTypes;
                    modalInstance.originalTask = JSON.stringify(task);
                    modalInstance.originalAttachment = JSON.stringify({});
                    modalInstance.attachment = {};
                    modalInstance.onCreate = onCreate;
                    modalInstance.onUpdate = onUpdate;
                    modalInstance.onDelete = onDelete;
                    modalInstance._dialogConfirm = _dialogConfirm;
                };

                //EXTERNAL METHODS
                return {
                    dialogConfirm: function (title, message, onConfirm) {
                        return _dialogConfirm(title, message, onConfirm);
                    },
                    dialogAlert: function (title, message, onConfirm) {
                        return _dialogAlert(title, message, onConfirm);
                    },
                    dialogPerform: function (title, message) {
                        return _dialogPerform(title, message);
                    },
                    dialogSuccess: function (message, onClose) {
                        return _dialogSuccess(message, onClose);
                    },
                    editTaskModal: function (task, taskList, roles, attachmentTypes, taskRoleTypes, onCreate, onUpdate, onDelete) {
                        return _editTaskModal(task, taskList, roles, attachmentTypes, taskRoleTypes, onCreate, onUpdate, onDelete);
                    }
                };
            }])
        .controller('DialogConfirmCtrl', ['$scope', '$uibModalInstance', 'title', 'message', 'onConfirmAction',
                        function ($scope, $uibModalInstance, title, message, onConfirmAction) {

                $scope.error = null;

                $scope.loading = false;
                $scope.title = title;
                $scope.message = message;

                $scope.ok = function () {
                    if(typeof onConfirmAction == 'function' ) {
                        $scope.loading = true;
                        onConfirmAction().then(
                            function success() {
                                $uibModalInstance.close();
                            },
                            serviceError
                        );
                    } else {
                        $uibModalInstance.close();
                    }
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };

                function serviceError(err) {
                    $scope.error = err;
                }
            }])

        .controller('DialogPerformCtrl', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                $scope.title = $uibModalInstance.title;
                $scope.message = $uibModalInstance.message;
            }])
        .controller('ModalCtrl', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                $scope.ok = function () {
                    $scope.loading = true;

                    $uibModalInstance.onConfirm(function () {
                        $uibModalInstance.close();
                    }, function (err) {
                        $scope.error = err;
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            }])
        .controller('TaskModalCtrl', ['$scope', '$uibModalInstance', '$window', '$translate', 'notify', 'APIService', 'Upload', 'UtilsService', 'StorageService', 'ModalService', function ($scope, $uibModalInstance, $window, $translate, notify, APIService, Upload, UtilsService, StorageService, ModalService) {
                $scope.task = $uibModalInstance.task;
                $scope.taskList = $uibModalInstance.taskList;
                $scope.roles = $uibModalInstance.roles;
                $scope.originalRoles = $uibModalInstance.originalRoles;
                $scope.originalTask = $uibModalInstance.originalTask;
                $scope.attachment = $uibModalInstance.attachment;
                $scope.originalAttachment = $uibModalInstance.originalAttachment;
                $scope.attachmentTypes = $uibModalInstance.attachmentTypes;
                $scope.selectedAttachmentType = null;
                $scope.taskRoleTypes = $uibModalInstance.taskRoleTypes;
                $scope.selectedTaskRoleType = null;
                $scope.progressVisible = false;
           
                $scope.close = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                // Check whether roles contains a given role
                $scope.containsTaskRole = function (roles, roleId) {
                    if (roles != null) {
                        return roles.filter(function (f) {
                            return f.administrativeRole.id === roleId;
                        }).length;
                    }
                    
                    return false;
                };
                
                // Get task role by id
                $scope.getTaskRoleById = function (roles, roleId) {
                    if (roles != null) {
                        return roles.filter(function (f) {
                            return f.administrativeRole.id === roleId;
                        })[0];
                    }
                    
                    return null;
                };
                
                // Handle task role type selection
                $scope.updateSelectedTaskRoleType = function (taskRole, selectedTaskRoleType) {
                    if (taskRole.isSelected) {
                        taskRole.roleType = selectedTaskRoleType;
                    }
                };

                // Recursive remove task role
                $scope.recursiveRemoveTaskRole = function (task, roles, callback) {
                    if (roles == null || roles.length == 0) {
                        return callback();
                    }

                    APIService.removeTaskRole(task.id, roles.shift()).then(
                        function successCallback() {
                            return $scope.recursiveRemoveTaskRole(task, roles, callback);
                        }
                    );
                };

                // Recursive create task role
                $scope.recursiveCreateTaskRole = function (task, roles, callback) {
                    if (roles == null || roles.length == 0) {
                        return callback();
                    }

                    roles.forEach(function (role) {
                        delete role.isSelected;
                    });
                    
                    APIService.createTaskRole(task.id, roles.shift()).then(
                        function successCallback() {
                            return $scope.recursiveCreateTaskRole(task, roles, callback);
                        }
                    );
                };
                
                // Recursive update task role
                $scope.recursiveUpdateTaskRole = function (task, roles, callback) {
                    if (roles == null || angular.isUndefined(roles) || roles.length == 0) {
                        return callback();
                    };

                    roles.forEach(function (role) {
                        delete role.isSelected;
                    });
                    
                    APIService.updateTaskRole(task.id, roles.shift()).then(
                        function successCallback() {
                            return $scope.recursiveUpdateTaskRole(task, roles, callback);
                        }
                    );
                };
                
                // Check whether the task list contains a given task name
                $scope.containsTaskName = function(id, name) {
                    if ($scope.taskList != null && name != null) {
                        return $scope.taskList.filter(function (f) {
                            return f.name === name && (id == null || id != f.id);
                        }).length;
                    }
                    
                    return false;
                };

                $scope.saveTask = function () {
                    if ($scope.containsTaskName($scope.task.data.name))
                    {
                        notify.logError("Nome del task duplicato");
                        return;
                    }

                    if ($scope.task.data.id == null)
                    {
                        APIService.createTask($scope.task.data).then(
                                function successCallback(data) {
                                    if ($scope.attachment.fileData != null) {
                                        $scope.uploadAttachment();
                                    }

                                    if (typeof $uibModalInstance.onCreate == 'function') {
                                        return $uibModalInstance.onCreate(data, function() {
                                            $uibModalInstance.dismiss();
                                        });
                                    }
                                }
                        );
                    }
                    else {
                        APIService.updateTask($scope.task.data).then(
                                function successCallback(data) {
                                    if (typeof $uibModalInstance.onUpdate == 'function') {
                                        return $uibModalInstance.onUpdate(data, function () {
                                            $uibModalInstance.dismiss();
                                        });
                                    }
                                }
                        );
                    }

                    // Get unselected roles
                    var toBeDeleted = $scope.roles.filter(function (f) {
                        return !f.isSelected && $scope.containsTaskRole($scope.task.data.roles, f.administrativeRole.id);
                    });

                    // Get selected roles
                    var toBeCreated = $scope.roles.filter(function (f) {
                        return f.isSelected && !$scope.containsTaskRole($scope.task.data.roles, f.administrativeRole.id);
                    });
                    
                    // Get updated roles
                    var toBeUpdated = $scope.task.data.roles.find(function(role) {
                        var administrativeRole = $scope.roles.find(function (f) {
                            return f.isSelected && f.administrativeRole.id === role.administrativeRole.id && role.roleType != f.roleType;
                        });
                        if (administrativeRole) {
                            role.roleType = administrativeRole.roleType;
                        }
                        return [];
                    });
            
                    // Persist task roles
                    $scope.recursiveRemoveTaskRole($scope.task.data, toBeDeleted, function() {
                        $scope.recursiveCreateTaskRole($scope.task.data, toBeCreated, function() {
                            $scope.recursiveUpdateTaskRole($scope.task.data, [].concat(toBeUpdated), function() {});
                        });
                    });
                };

                $scope.isChanged = function () {
                    return JSON.stringify($scope.task) != $scope.originalTask ||
                            JSON.stringify($scope.attachment) != $scope.originalAttachment ||
                            JSON.stringify(angular.copy($scope.task.data.roles)) != $scope.roles;
//                            JSON.stringify(angular.copy($scope.roles)) != $scope.originalRoles;
                };

                // Delete task
                $scope.deleteTask = function () {
                    $uibModalInstance._dialogConfirm("task-delete-dialog-title",
                            "task-delete-dialog-message", function (success, error) {
                                APIService.deleteTask($scope.task.data.id).then(
                                        function successCallback() {
                                            if (typeof $uibModalInstance.onDelete == 'function') {
                                                return $uibModalInstance.onDelete($scope.task.data, function() {
                                                    success();
                                                    $uibModalInstance.dismiss();                                                    
                                                });
                                            }
                                        }
                                );
                            });
                };

                // Upload attachment
                $scope.uploadAttachment = function (attachmentType) {
                    if ($scope.attachment.fileData != null) {
                        var data = $scope.attachment.fileData.substr($scope.attachment.fileData.indexOf('base64,') + 7);

                        var attach = {
                            "filename": $scope.attachment.file.name,
                            "description": $scope.attachment.file.name,
                            "mimeType": $scope.attachment.file.type,
                            "size": $scope.attachment.file.size,
                            "data": data,
                            "type": attachmentType
                        };

                        // Upload task attachment iff task was already created
                        if ($scope.task.data.id != null) {
                            APIService.uploadTaskAttachment($scope.task.data.id, attach).then(
                                    function successCallback(attachment) {
                                        $scope.task.data.attachments.push(attachment);

                                        // Reset field values
                                        $('#file').val('');
                                        $scope.attachmentType = $scope.attachmentTypes[0];
                                    }
                            );
                        } else {
                            $scope.task.data.attachments.push(attach);
                        }
                        
                        /*Upload.upload({
                                url: 'rest/gantt/task/' + $scope.task.data.id + '/uploadFile/',
                                method: 'PUT',
                                headers: {
                                    'Authorization': StorageService.getLocalStorage('Authorization'),
                                    'Content-type': 'application/json'
                                },
                                file: data,
                                data: {"filename": $scope.attachment.file.name}
                            }).then(function (resp) {
                                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                            }, function (resp) {
                                console.log('Error status: ' + resp.status);
                            }, function (evt) {
                                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                                console.log('uploadAttachment: ' + $scope.progress);
                            });*/
                    }
                };
                
                $scope.uploadFile = function(attachmentType) {
                    if ($scope.attachment.fileData != null) {
                        var xhr = new XMLHttpRequest();
                        var data = $scope.attachment.fileData.substr($scope.attachment.fileData.indexOf('base64,') + 7);

                        console.log($scope.attachment.file);

                        var attach = {
                            "filename": $scope.attachment.file.name,
                            "description": $scope.attachment.file.name,
                            "mimeType": $scope.attachment.file.type,
                            "size": $scope.attachment.file.size,
                            "data": data,
                            "type": attachmentType
                        };

                        /* event listners */
                        xhr.upload.addEventListener("progress", uploadProgress, false);
                        xhr.addEventListener("load", uploadComplete, false);
                        xhr.addEventListener("error", uploadFailed, false);
                        xhr.open("PUT", 'rest/gantt/task/' + $scope.task.data.id + '/uploadFile/');
                        xhr.setRequestHeader("Content-Type", "application/json");
                        xhr.setRequestHeader("Authorization", StorageService.getLocalStorage('Authorization'));
                        xhr.send(JSON.stringify(attach));
                        
                        // Parse response
                        /*var jsonResponse = JSON.parse(xhr.responseText);
                        console.log(jsonResponse);*/
                    }
                };
                
                // Update progress bar
                function uploadProgress(evt) {
                    $scope.$apply(function() {
                        if (evt.lengthComputable) {
                            $scope.progress = Math.round(evt.loaded * 100 / evt.total);
                        } else {
                            $scope.progress = 'unable to compute';
                        }
                    });
                }
                
                function uploadComplete(evt) {
                    console.log("uploadComplete");
                    console.log(evt);
                    console.log($scope.task.data);
                    if (evt.target.status === 200) {
                        $scope.task.data.attachments.push(JSON.parse(evt.target.response));
                        $scope.$apply();
                    } else {
                        uploadFailed(evt);
                    };
                    $scope.progressVisible = false;
                }

                function uploadFailed(evt) {
                    $scope.progressVisible = false;
                    notify.logError("Errore durante l'upload del file");
                    console.log(JSON.stringify(evt));
                }

                // Download attachment
                $scope.downloadAttachment = function (attachmentId) {
                    APIService.getAttachmentById(attachmentId).then(
                            function successCallback(attachment) {
                                if (attachment)
                                {
                                    var mimeType = attachment.mimeType;
                                    var filename = attachment.filename;

                                    var blob = UtilsService.base64toBlob(attachment.data, mimeType);

                                    if (window.saveAs) {
                                        window.saveAs(blob, filename);
                                    } else if (navigator.msSaveBlob) {
                                        navigator.msSaveBlob(blob, filename);
                                    } else {
                                        var url = URL.createObjectURL(blob);
                                        var downloadLink = document.createElement("a");
                                        downloadLink.href = url;
                                        downloadLink.download = filename;

                                        document.body.appendChild(downloadLink);
                                        downloadLink.click();
                                        document.body.removeChild(downloadLink);
                                    }
                                }
                            }
                    );
                };

                // Delete task attachment
                $scope.deleteAttachment = function (attachmentId) {
                    ModalService.dialogConfirm("ctx-delete-attachment-dialog-title", "ctx-delete-attachment-dialog-message", function (success, error) {
                        APIService.deleteTaskAttachment($scope.task.data.id, attachmentId).then(
                                function successCallback() {
                                    // Dismiss confirm dialog
                                    success();

                                    // Refresh attachment list
                                    $scope.task.data.attachments.forEach(function (attachment, index) {
                                        if (attachment.id == attachmentId) {
                                            $scope.task.data.attachments.splice(index, 1);
                                        }
                                    });

                                    notify.logSuccess($translate.instant("ctx-delete-attachment-dialog-success"));
                                }
                        );
                    });
                };
            }]);
