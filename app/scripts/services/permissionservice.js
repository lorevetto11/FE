'use strict';

/**
 * @ngdoc function
 * @name APP.services:StorageService
 * @description
 * # StorageService
 * Service for interacting with storage (local, session, etc...) of the APP
 */
angular.module('APP')
.factory('PermissionService', function ($resource, $rootScope, $q, $cookies, $filter, $log, ResourceService, APIService, ENV) {

    //INTERNAL METHODS

    var _grants = null;

    var _loadGrants = function() {
        return $q(function (resolve, reject) {
            if(_grants) {
                return resolve(_grants);
            } else {
                var currentUser = ResourceService.getCurrentUser();
                if (currentUser && currentUser.role) {
                    APIService.getRoleById(currentUser.role.id).then(
                        function success(data) {
                            var grants = [];
                            data.profiles.forEach(function (profile) {
                                profile.grants.forEach(function (grant) {
                                    grants.push(grant);
                                });
                            });
                            _grants = $filter('unique')(grants, 'id');
                            resolve(_grants);
                        })
                } else {
                    reject();
                }
            }
        });
    };

    var _isConsultant = function()
    {
        var currentOrganization = ResourceService.getCurrentOrganization();

        if(currentOrganization == null)
            return false;

        return currentOrganization.type == 'CONSULTANT';
    };

    var _isOrganizationAdmin = function()
    {
        var currentUser = ResourceService.getCurrentUser();

        if(currentUser == null)
            return false;

        return currentUser.userType == 'ADMIN';
    };

    var _isFunctionAdmin = function()
    {
        var currentUser = ResourceService.getCurrentUser();

        if(currentUser == null)
            return false;

        return currentUser.userType == 'ADMIN' || currentUser.userType == 'PURCHASER' || currentUser.userType == 'SUPERADMIN';
    };

    var _isUserAuthorized = function (_userRight) {

        function hasGrant(grant) {
            return (_grants || []).find(function(g){
                    return g.name == _userRight;
                }) != null;
        }

        return $q(function (resolve, reject) {
            _loadGrants().then(
                function () {
                    resolve(hasGrant(_userRight));
                },
                function () {
                    resolve(false)
                }
            )
        });
    };

    //EXTERNAL METHODS
    return {
        isOrganizationAdmin: function () {
            //TODO:decrypt?
            return _isOrganizationAdmin();
        },
        isConsultant: function () {
            //TODO:decrypt?
            return _isConsultant();
        },
        isFunctionAdmin: function () {
            //TODO:decrypt?
            return _isFunctionAdmin();
        },
        isUserAuthorized: function(auth) {
            return _isUserAuthorized(auth);
        },
        loadGrants: function() {
            return _loadGrants();
        }
    };



});
