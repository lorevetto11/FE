'use strict';

/**
 * @ngdoc function
 * @name ResourceService
 * @description
 * # ResourceService
 * Service for context informations of the APP
 */
angular.module('APP')
.factory('ResourceService', function ($resource, $rootScope, $q, $translate, $filter, amMoment, StorageService, ENV) {
    var _applicationInfo;
    var _currentUser;
    var _currentLanguage;
    var _currentOrganization;
    var _selectedOrganization;
    var _selectedFloor;
    var _labelTypes;
    var _productTypes;
    //var _productCategories;
    //var _placeCategories;
    var _productCategories;
    var _placeCategories;
    var _organizations;
    var _searchFilter;
    var _places;
    var _languages;
    var _inks;
    var _grants;
    var _isVerifier;
    var _filter;
    var _currentFlow;
    var _selectedDiagram;

    var _clearAll = function() {
        StorageService.clearAll();

        _applicationInfo = _currentUser = _currentLanguage = _currentOrganization = _selectedOrganization = _selectedFloor =
        _labelTypes = _productTypes = _productCategories = _placeCategories = _productCategories =
        _placeCategories = _organizations = _searchFilter = _places = _languages = _inks = _grants = _isVerifier = _filter =
        _currentFlow = _selectedDiagram = null;
    }


    var _getApplicationInfo = function () {
        if (!_applicationInfo)
        {
            _applicationInfo = StorageService.getLocalStorage('context.applicationInfo');
        }
        return _applicationInfo;
    };
    var _setApplicationInfo = function (value) {
        _applicationInfo = value;
        StorageService.putLocalStorage('context.applicationInfo',_applicationInfo);
    };
    var _clearContext = function () {
        _setCurrentUser(null);
    };
    var _getCurrentUser = function() {
        if (!_currentUser)
        {
            _currentUser = StorageService.getLocalStorage('context.currentUser');
        }
        return _currentUser;
    };
    var _setCurrentUser = function(_user) {
        StorageService.putLocalStorage('context.currentUser', _user);
        _currentUser = _user;
    };

    var _getCurrentLanguage = function() {
        if (!_currentLanguage)
        {
            _currentLanguage = StorageService.getLocalStorage('context.currentLanguage');
            //If not selected get system current language
            if (!_currentLanguage)
            {
                _currentLanguage = ENV.language;
                _setCurrentLanguage(_currentLanguage);
            }
        }
        return _currentLanguage;
    };
    var _setCurrentLanguage = function(value) {
        $translate.use(value);
        amMoment.changeLocale(value);
        StorageService.putLocalStorage('context.currentLanguage', value);
        _currentLanguage = value;
    };


    var _getCurrentOrganization = function() {
        if (!_currentOrganization)
        {
            _currentOrganization = StorageService.getLocalStorage('context.currentOrganization');
        }
        return _currentOrganization;
    };

    var _setCurrentOrganization = function(_organization) {
        StorageService.putLocalStorage('context.currentOrganization', _organization);
        _currentOrganization = angular.copy(_organization);
    };

    var _getSelectedOrganization = function() {
        if (!_selectedOrganization)
        {
            _selectedOrganization = StorageService.getLocalStorage('context.selectedOrganization');
        }
        return angular.copy(_selectedOrganization);
    };

    var _setSelectedOrganization = function(_organization) {
        StorageService.putLocalStorage('context.selectedOrganization', _organization);
        _selectedOrganization = _organization;
    };

    var _getSelectedFloor = function() {
        if (!_selectedFloor)
        {
            _selectedFloor = StorageService.getLocalStorage('context.selectedFloor');
        }
        return _selectedFloor;
    };

    var _setSelectedFloor = function(_floor) {
        StorageService.putLocalStorage('context.selectedFloor', _floor);
        _selectedFloor = _floor;
    };


    var _getOrganizations = function() {
        if (!_organizations)
        {
            _organizations = StorageService.getLocalStorage('context.organizations');
        }
        return _organizations;
    };

    var _setOrganizations = function(organizations) {
        StorageService.putLocalStorage('context.organizations', organizations);
        _organizations = organizations;
    };

    var _setLanguages = function(languages) {
        StorageService.putLocalStorage('context.languages', languages);
        _languages = languages;
    };
    
    
    var _getGrants = function() {
        return _grants;
    };
    
    var _setGrants = function(value) {
        _grants = value;
    };
    
    var _getIsVerifier = function() {
        if (!_isVerifier)
        {
            _isVerifier = StorageService.getLocalStorage('context.isVerifier');
        }
        return _isVerifier;
    };
    var _setIsVerifier = function(isVerifier) {
        StorageService.putLocalStorage('context.isVerifier', isVerifier);
        _isVerifier = isVerifier;
    }; 
    
    var _getFilter = function() {
        if (!_filter)
        {
            _filter = StorageService.getLocalStorage('context.filter');
        }
        return _filter;
    };
    var _setFilter = function(filter) {
        StorageService.putLocalStorage('context.filter', filter);
        _filter = filter;
    };

    var _getCurrentFlow = function() {
        if (!_filter)
        {
            _filter = StorageService.getLocalStorage('context.currentFlow');
        }
        return _filter;
    };
    var _setCurrentFlow = function(flow) {
        StorageService.putLocalStorage('context.currentFlow', flow);
        _currentFlow = flow;
    };

    var _getSelectedDiagram = function() {
        return _selectedDiagram;
    };
    var _setSelectedDiagram = function(diagram) {
        _selectedDiagram = diagram;
    };
    

    

    return {
        clearAll: function() {
            return _clearAll()
        },

        getApplicationInfo : function() {
            return _getApplicationInfo();
        },
        setApplicationInfo : function(_value) {
            _setApplicationInfo(_value);
        },
        clearContext: function() {
            _clearContext();
            $rootScope.$broadcast('resourceChange');
        },
        getCurrentUser: function() {
            return _getCurrentUser();
        },
        setCurrentUser: function(_user) {
            _setCurrentUser(_user);
            $rootScope.$broadcast('resourceChange');
        },
        getCurrentUserImage: function() {
            return null;//_getCurrentUserImage();
        },
        getCurrentLanguage: function() {
            return _getCurrentLanguage();
        },
        setCurrentLanguage: function(_lang) {
            _setCurrentLanguage(_lang);
            $rootScope.$broadcast('resourceChange');
        },
        getCurrentOrganization: function() {
            return _getCurrentOrganization();
        },
        setCurrentOrganization: function(_organization) {
            _setCurrentOrganization(_organization);
            $rootScope.$broadcast('resourceChange');
        },
        getSelectedOrganization: function() {
            return _getSelectedOrganization();
        },
        setSelectedOrganization: function(_organization) {
            _setSelectedOrganization(_organization);
            $rootScope.$broadcast('resourceChange');
        },

        getSelectedFloor: function() {
            return _getSelectedFloor();
        },
        setSelectedFloor: function(_floor) {
            _setSelectedFloor(_floor);
            $rootScope.$broadcast('resourceChange');
        },

        getOrganizations: function() {
            return _getOrganizations();
        },
        setOrganizations: function(_organization) {
            _setOrganizations(_organization);
            $rootScope.$broadcast('resourceChange');
        },

        getIsVerifier: function() {
            return _getIsVerifier();
        },
        setIsVerifier: function(isVerifier) {
            _setIsVerifier(isVerifier);
            $rootScope.$broadcast('resourceChange');
        },
        getFilter: function() {
            return _getFilter();
        },
        setFilter: function(filter) {
            _setFilter(filter);
            $rootScope.$broadcast('resourceChange');
        },
        getCurrentFlow: function() {
            return _getCurrentFlow();
        },
        setCurrentFlow: function(flow) {
            _setCurrentFlow(flow);
            $rootScope.$broadcast('resourceChange');
        },

        getSelectedDiagram: function() {
            return _getSelectedDiagram();
        },
        setSelectedDiagram: function(diagram) {
            _setSelectedDiagram(diagram);
        }

    };
});
