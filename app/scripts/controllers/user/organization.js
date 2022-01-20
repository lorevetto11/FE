'use strict';

angular.module('APP')
.controller('OrganizationHomeCtrl', function ($scope, $state, $translate, $q, $timeout, $uibModal, $log, $rootScope, $window,
                                              UtilsService, Person, currentUser, ValidationService, notify,
                                              Organization, OrganizationPlace, OrganizationCertification, Attachment,
                                              currentOrganization, ModalService, APIService, ResourceService) {

    $scope.items = null;
    $scope.itemsLoading = null;

    $scope.loader = false;
    $scope.selectedItem = null;

    $scope.selected = {
        item : null
    };
    
    $scope.filter = {
        keyword: null
    };

    $scope.possibleOrganizations = null;
    $scope.kinshipLevels = null;

    $scope.pattern = ValidationService.PATTERN;
    $scope.editingOrganization = null;

    $scope.certifications = null;
    $scope.places = null;

    var _originalPlaces = null;
    var _originalCertifications = null;
    var _originalOrganization = null;


    $scope.add = function () {

        $scope.selected.item = null;
        $scope.certifications = null;
        $scope.places = null;

        $timeout(function () {
            $scope.selected.item = new Organization();
            $scope.possibleOrganizations = getPossibleOrganizations();
        }, 0);

        $scope.editingOrganization = false;
    };

    $scope.edit = function (item) {

        $scope.selected.item = null;
        $scope.editingOrganization = true;
        $scope.possibleOrganizations = getPossibleOrganizations(item);

        $scope.certifications = null;
        $scope.places = null;
        $scope.loader = true;

        APIService.getOrganizationById(item.id).then(
            function success(organization) {

                $log.info('organization:', organization);

                APIService.getOrganizationPlaces(organization.id).then(
                    function success(places) {

                        $log.info('organization:', organization);
                        $scope.places = places.filter(function(p){ return p.organization.id == organization.id;});
                        _originalPlaces = angular.copy($scope.places);

                        APIService.getOrganizationCertifications(organization.id).then(
                            function success(certifications) {

                                $log.info('certifications:', certifications);

                                var contextIds = certifications.filter(function(c){
                                    return c.context != null;
                                }).map(function(c){
                                    return c.context.id;
                                });

                                APIService.recursiveCall(contextIds, APIService.getAttachmentsByContextId).then(
                                    function success(attachments) {
                                        certifications.forEach(function(c){
                                            if(c.context) {
                                                c.attachment = attachments.find(function(a){
                                                    return a.context.id == c.context.id;
                                                });
                                            }
                                        });
                                        $scope.certifications = certifications.filter(function(c){ return c.organization.id == organization.id;});
                                        _originalCertifications = angular.copy($scope.certifications);

                                        $scope.selected.item = organization;
                                        _originalOrganization = angular.copy($scope.selected.item);


                                        $scope.loader = false;
                                    },loadingError );
                            },loadingError );
                    },loadingError );
            },loadingError );
        /*
         $timeout(function () { // setTimeout semplice per risparmiare tempo, visto che non sono in grado di risolvere utlizzando form.$dirt = false e non saprei come altro fare
         $scope.selected.item = angular.copy(item);
         }, 0);
         */
    };

    $scope.cancel = function () {
        $scope.selected.item = null;
    };

    $scope.delete = function (item) {

        $log.info($scope.items);

        // check for children
        var child = $scope.items.find(function(i){
            return i.organization && i.organization.id == item.id;
        })

        if(child != null) {
            ModalService.dialogAlert(
                'Delete', 'Organization <strong>' + item.name + '</strong> has undeleted sub organizations. <br/>If you want to proceed, please delete them before.');
            return;
        }

        ModalService.dialogConfirm(
            'Delete', 'Organization <strong>' + item.name + '</strong> will be deleted. May I proceed? ',
            function onConfirmAction() {
                return $q(function (resolve, reject) {

                    APIService.deleteOrganization(item.id).then(
                        function onSuccess(){
                            $rootScope.$broadcast('organizationsChange');
                            resolve();
                        }, reject);
                });
            }
        ).then(init);
    };


    $scope.save = function (item, form) {

        if (form.$invalid) {
            ValidationService.dirtyForm(form);
            return false;
        }

        $window.scrollTo(0, 0);
        $scope.loader = true;

        if (item.id == null) {
            createOrganization(item).then(
                function success(item) {
                    notify.logSuccess('', 'Salvataggio avvenuto con successo');
                    init();
                    $scope.edit(item);
                    //$scope.selected.item = item;
                    //$scope.editingOrganization = true;
                }, savingError  );
        } else {
            updateOrganization(item).then(
                function success() {
                    notify.logSuccess('','Salvataggio avvenuto con successo');
                    init();
                    $scope.edit(item);
                }, savingError  );
        }

        function createOrganization(item) {
            return $q(function (resolve, reject) {
                APIService.createOrganization(item).then(
                    function success(item) {
                        $rootScope.$broadcast('organizationsChange');

                        saveOrganizationPlaces(item).then(
                            function success() {
                                saveOrganizationCertifications(item).then(function(){
                                    resolve(item);
                                }, reject);
                            }, reject);
                    }, reject);
            });
        }

        function updateOrganization(item) {
            return $q(function (resolve, reject) {
                APIService.updateOrganization(item).then(
                    function success(item) {
                        $rootScope.$broadcast('organizationsChange');
                        saveOrganizationPlaces(item).then(
                            function success() {
                                saveOrganizationCertifications(item).then(resolve, reject);
                            }, reject  );
                    }, reject );
            });
        };



        function saveOrganizationPlaces(organization) {
            return $q(function (resolve, reject) {

                ($scope.places || []).forEach(function(p){
                    p.organization = new Organization(organization.id);
                });

                var toBeAdded = angular.copy($scope.places.filter(function(p){
                    return !p.id && !p.deleted;
                }));

                var toBeDeleted = angular.copy($scope.places.filter(function(p){
                    return p.id && p.deleted;
                }).map(function(p){ return p.id; }));

                var toBeUpdated = angular.copy($scope.places.filter(function(p){
                    return p.id && !p.deleted &&
                        !angular.equals(p, _originalPlaces.find(function(i){
                            return i.id == p.id;
                        }));
                }));

                APIService.recursiveCall(toBeAdded, APIService.createOrganizationPlace).then(
                    function() {
                        APIService.recursiveCall(toBeUpdated, APIService.updateOrganizationPlace).then(
                            function() {
                                APIService.recursiveCall(toBeDeleted, APIService.deleteOrganizationPlace).then(
                                    resolve, reject  );
                            }, reject  );
                    }, reject  );
            });
        };

        function saveOrganizationCertifications(organization) {
            return $q(function (resolve, reject) {

                ($scope.certifications || []).forEach(function (p) {
                    p.organization = new Organization(organization.id);
                });

                var toBeAdded = angular.copy($scope.certifications.filter(function (p) {
                    return !p.id && !p.deleted;
                }));

                var toBeDeleted = angular.copy($scope.certifications.filter(function (p) {
                    return p.id && p.deleted;
                }).map(function (p) {
                    return p.id;
                }));

                var toBeUpdated = angular.copy($scope.certifications.filter(function (p) {
                    return p.id && !p.deleted && !angular.equals(p, _originalCertifications.find(function (i) {
                            return i.id == p.id;
                        }));
                }));

                function createCertification(item) {
                    return $q(function (resolve, reject) {

                        var attachment = item.attachment ? new Attachment(item.attachment.id) : null;
                        var certification = OrganizationCertification.parse(item);

                        APIService.createOrganizationCertification(certification).then(
                            function success(data) {
                                $log.info("createOrganizationCertification: ", data);
                                if (attachment && data.context) {
                                    attachment.context = data.context;
                                    return APIService.updateAttachment(attachment).then(resolve, reject);
                                } else {
                                    resolve(data)
                                }
                            }, reject);
                    });
                }

                function updateCertification(item) {
                    return $q(function (resolve, reject) {

                        var attachment = item.attachment ? new Attachment(item.attachment.id) : null;
                        var certification = OrganizationCertification.parse(item);
                        var original = _originalCertifications.find(function (c) {
                                return c.id == certification.id;
                            }) || {};

                        // remove attachment ( even if it has been changed
                        if (original.attachment && (!attachment || attachment.id != original.attachment.id)) {
                            APIService.deleteAttachment(original.attachment.id);
                        }

                        APIService.updateOrganizationCertification(certification).then(
                            function success(data) {
                                $log.info("createOrganizationCertification: ", data);
                                if (attachment && data.context) {
                                    attachment.context = data.context;
                                    return APIService.updateAttachment(attachment).then(resolve, reject);
                                } else {
                                    resolve(data);
                                }
                            }, reject);
                    });
                }

                APIService.recursiveCall(toBeAdded, createCertification).then(function () {
                    APIService.recursiveCall(toBeUpdated, updateCertification).then(function () {
                        APIService.recursiveCall(toBeDeleted, APIService.deleteOrganizationCertification).then(
                            resolve, reject);
                    }, reject);
                }, reject);
            });
        }
    };



    $scope.addPlace = function () {
        if($scope.places == null) {
            $scope.places = [];
        }
        $scope.places.push(new OrganizationPlace())
    };

    $scope.removePlace = function(place) {
        var idx = $scope.places.indexOf(place);
        if(idx != null){
            $scope.places[idx].deleted = true;
        }
    };

    $scope.addCertification = function () {
        if($scope.certifications == null) {
            $scope.certifications = [];
        }
        $scope.certifications.push(new OrganizationCertification())
    };

    $scope.itemsFilter = function (item) {

        var result = true;

        if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
            result &= (item.name && item.name.toLowerCase().indexOf($scope.filter.keyword.toLowerCase()) != -1);
        }

        return result;
    };

    function savingError() {
        $scope.loader = false;
        $scope.errorMessage = "Saving data error!";
    }

    function loadingError() {
        $scope.loader = false;
        $scope.errorMessage = "loader data error!";
    }

    function getPossibleOrganizations(organization) {
        if (organization == null) {  // Then we're adding, so we need to return every items
            return $scope.items;
        } else {
            return ($scope.items || []).filter(function (item) {
                if (!isMyAncestor(item, organization)) {
                    return true;
                }
            });
        }

    }

    function isMyAncestor(org, root) {
        if (org.id == root.id) {
            return true;
        }
        if (org.organization == null) {
            return false;
        }
        if (org.organization.id == null) {
            return false;
        }
        if (org.organization.id == root.id) {
            return true;
        }
        var parent = $scope.items.find(function (item) {
            return item.id == org.organization.id;
        });
        return parent != null && isMyAncestor(parent, root);
    }

    function orderTree(array) {
        var orderedTree = [];
        var root = findRoot(array);

        if (root != null) {
            orderedTree.push(root);
            deleteNode(root, array);
            orderedTree = orderedTree.concat(childrensTree(root, array));
        }

        return orderedTree;
    }

    function findRoot(tree) {
        var root = null;

        tree.forEach(function (node) {
            if (!isNotRoot(node, tree)) {
                root = node;
            }
        });

        return root;
    }

    function isNotRoot(node, tree) {

        var isRoot = false;
        for (var n = 0; n < tree.length; n++) {
            if (node.organization != null && node.organization.id == tree[n].id) {
                return true;
            }
        }
        return isRoot;
    }

    function childrensTree(root, tree, childrens) {
        var childrens = childrens || [];
        var rootChildrens = [];

        for (var n = 0; n < tree.length; n++) {
            if (tree[n].organization.id == root.id) {
                rootChildrens.push(tree[n]);
                deleteNode(tree[n], tree);
                n--;
            }
        }

        if (rootChildrens.length != 0) {
            rootChildrens.forEach(function (node) {
                childrens.push(node);
                childrensTree(node, tree, childrens);
            });
        }

        return childrens;
    }

    function deleteNode(node, array) {
        array.splice(array.indexOf(node), 1);
    }

    function kinshipLevel(orgs) {
        var level = 0;
        var levelDict = new Map();

        orgs.forEach(function (item) {
            levelDict.set(item.id, levels(item, level));
        });

        return levelDict;
    }

    function levels(org, level) {

        if (org == null || org.organization == null) {
            return level;
        }

        var parent = $scope.items.find(function (item) {
            return item.id == org.organization.id;
        });

        return levels(parent, level + 1);

    }

    function init() {

        $scope.items = null;
        $scope.itemsLoading = true;
        $scope.selected.item = null;

        var selectedOrganization = ResourceService.getSelectedOrganization();

        if( $state.current.name == 'organization') {
            // nella pagina generale, mostro sempre l'alberatura completa rispotto all'organizzazione dell'utente
            selectedOrganization = null;
        }

        APIService.getOrganizations(selectedOrganization ? selectedOrganization.id : null).then(
            function successCallback(data) {

                //$scope.items = orderTree(data);
                $scope.items = UtilsService.organizationOrderTree(data);
                $scope.itemsLoading = null;

                setTimeout(function () {
                    $scope.kinshipLevels = UtilsService.organizationBuildKinshipLevel($scope.items);
                }, 0);
            }
        );
    }

    init();

});
