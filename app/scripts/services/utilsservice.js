'use strict';

/**
 * @ngdoc function
 * @name APP.services:UtilityService
 * @description
 * # StorageService
 * Utility Service wrapping common methods of the APP
 */
angular.module('APP')
.factory('UtilsService', function ($resource, $rootScope, $q, $cookies, $translate, $http, moment, StaffHygiene, APIService) {

    //INTERNAL METHODS
    var _hexToRgb = function (hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };


    var _rgbToHex = function (r, g, b) {

        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }

        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };


    var _clearObjetField = function (obj, fieldName) {

        if (obj === null) {
            return null;
        }

        if (typeof obj === 'object') {
            if (typeof obj.length == 'number') {
                for (var i = 0, len = obj.length; i < len; ++i)
                    obj[i] = _clearObjetField(obj[i], fieldName);
            }
            else {
                for (var field in obj) {
                    if (field === fieldName) {
                        delete obj[field];// = null;
                    }
                    else if (typeof obj[field] == 'object') {
                        obj[field] = _clearObjetField(obj[field], fieldName);
                    }
                }
            }
        }
        return obj;
    };

    var _base64toBlob = function (b64Data, contentType) {
        contentType = contentType || '';
        var sliceSize = 512;
        b64Data = b64Data.replace(/^[^,]+,/, '');
        b64Data = b64Data.replace(/\s/g, '');
        var byteCharacters = window.atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    };

    var _checkRemoteLinkReachability = function (url) {
        return $q(function (resolve, reject) {
            $.ajax({
                url: url,
                dataType: "jsonp",
                method: 'GET',
                success: resolve,
                error: function (xhr, status, error) {
                    if (xhr && xhr.status < 400) {
                        resolve();
                    } else {
                        reject();
                    }
                }
            });
        });
    };

    function autoCreateStaffHygieneItems(users, monitorings) {

        APIService.getPeopleByOrganizationId().then(
            function (data) {
                var users = data;
                APIService.getMonitoringsByOrganizationId().then(
                    function (data) {
                        var monitorings = data;
                        APIService.getStaffHygienesByOrganizationId().then(
                            function (data) {
                                var items = data;

                                users.forEach(function (u) {
                                    var item = items.find(function (i) {
                                        return i.userId === u.id;
                                    });

                                    if (item == null) {
                                        item = new StaffHygiene();
                                        item.userId = u.id;
                                        APIService.createStaffHygiene(item).then(
                                            function successCallback(data) {
                                                monitorings.forEach(function (m) {
                                                    var audit = new Audit(data.id);
                                                    audit.monitoringId = m.id;
                                                    audit.frequency.justOnce = true;
                                                    APIService.createAudit(audit).then();
                                                });
                                            }
                                        );
                                    } else {
                                        monitorings.forEach(function (m) {
                                            var audit = $scope.audits.find(function (a) {
                                                return a.prerequisiteId === item.id && a.monitoringId == m.id;
                                            })
                                            if (audit === null) {
                                                audit = new Audit(item.id);
                                                audit.monitoringId = m.id;
                                                audit.frequency.justOnce = true;
                                                APIService.createAudit(audit).then();
                                            }
                                        });
                                    }
                                });

                            });
                    });
            });
    }
    
    var _organizationOrderTree = function (organizations) {

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

            return childrens; //.sort(function(a,b){ return b.name.localeCompare(a.name)});
        }

        function deleteNode(node, array) {
            array.splice(array.indexOf(node), 1);
        }


        var orderedTree = [];
        var root = findRoot(organizations);

        if (root != null) {
            orderedTree.push(root);
            deleteNode(root, organizations);
            orderedTree = orderedTree.concat(childrensTree(root, organizations));
        }

        return orderedTree;
    }


    var _organizationBuildKinshipLevel = function (organizations) {
        var level = 0;
        var levelDict = new Map();

        function levels(org, level) {
            if (org == null || org.organization == null) {
                return level;
            }
            var parent = organizations.find(function (item) {
                return item.id == org.organization.id;
            });
            return levels(parent, level + 1);
        }

        organizations.forEach(function (item) {
            levelDict.set(item.id, levels(item, level));
        });

        return levelDict;
    }


    // init();


    //EXTERNAL METHODS
    return {
        hexToRgb: function (hex) {
            return _hexToRgb(hex);
        },
        rgbToHex: function (r, g, b) {
            return _rgbToHex(r, g, b);
        },
        clearObjectField: function (obj, fieldName) {
            return _clearObjetField(obj, fieldName);
        },
        base64toBlob: function (b64Data, contentType) {
            return _base64toBlob(b64Data, contentType);
        },
        checkRemoteLinkReachability: function (url) {
            return _checkRemoteLinkReachability(url);
        },
        organizationOrderTree: function (organizations) {
            return _organizationOrderTree(organizations);
        },
        organizationBuildKinshipLevel: function (organizations) {
            return _organizationBuildKinshipLevel(organizations);
        }
    };
});
