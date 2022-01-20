'use strict';

/**
 * @ngdoc overview
 * @name APP
 * @description
 * # APP
 *
 * Main module of the application.
 */


angular
    .module('APP', [
        'APP.config',
        'ngAnimate',
        'ngAria',
        'ngRoute',
        'ngCookies',
        'ngMessages',
        'ngResource',

        'ngSanitize',
        'ngTouch',
        'ngCookies',

        'ui.router',
        'ui.validate',
        'ui.calendar',
        'ui.bootstrap',
        'ui.bootstrap.tabs',
        'angular-loading-bar',
        'ui.bootstrap-slider',
        'pascalprecht.translate',   // Translate
        'LocalStorageModule',       // LocalStorage
        'ui.bootstrap.datepickerPopup',

        'app.layout',
        'app.nav',
        'app.i18n',
        'app.page',

        'angularMoment',
        'angular-md5',
        'angular-repeat-n',
        'angular-table',
        'ui.sortable',
        'chart.js',
        'wt.responsive',
        'highcharts-ng'
    ])
    .config(config)
    .run(run)
;

function config($translateProvider, $provide, $compileProvider, $urlRouterProvider,
                $stateProvider, $httpProvider, localStorageServiceProvider, ChartJsProvider) {
    //$compileProvider.debugInfoEnabled(false);

    //http://stackoverflow.com/a/15769779/2929757
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|data|file|blob):/);

    localStorageServiceProvider.setPrefix('it.gpi.scm');

    ChartJsProvider.setOptions({colors: ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']});

    // BUNDLES ////////////////////////////////
    $translateProvider.preferredLanguage('en-US');
    $translateProvider.useStaticFilesLoader({
        prefix: 'language/locale_',
        suffix: '.json'
    });
    $translateProvider.useCookieStorage();
    $translateProvider.useLocalStorage();
    $translateProvider.useSanitizeValueStrategy('escape');

    $provide.decorator('$state', function ($delegate, $rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, state, params) {
            $delegate.current = state;
            $delegate.toParams = params;
        });
        return $delegate;
    });

    $httpProvider.interceptors.push('APIInterceptor');

    // ROUTING /////////////////////////////
    $urlRouterProvider.otherwise('/login');


    $urlRouterProvider.when('/prerequisite', '/prerequisite/layout');
    $urlRouterProvider.when('/user', '/user/organization');
    $urlRouterProvider.when('/task', '/task/prerequisite');
    $urlRouterProvider.when('/audit', '/audit/system');
    $urlRouterProvider.when('/noncompliance', '/noncompliance/home');
    $urlRouterProvider.when('/training', '/training/course');
    $urlRouterProvider.when('/riskAnalysis', '/riskAnalysis/home');
    $urlRouterProvider.when('/haccp', '/haccp/home');
    $urlRouterProvider.when('/data', '/data/procedure');
    $urlRouterProvider.when('/drawChart', '/drawChart/home');
    $urlRouterProvider.when('/setting', '/setting/data');
    $urlRouterProvider.when('/setting', '/setting/data');
    $urlRouterProvider.when('/print', '/print/home');

    $stateProvider
        .state('401', {
            url: '/401',
            templateUrl: 'views/error_states/401.html'
        })
        .state('403', {
            url: '/403',
            templateUrl: 'views/error_states/403.html'
        })
        .state('404', {
            url: '/404',
            templateUrl: 'views/error_states/404.html'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .state('welcome', {
            url: '/welcome',
            templateUrl: 'views/public/welcome.html',
            controller: 'WelcomeCtrl'
        })
        .state('profle', {
            url: '/profile',
            templateUrl: 'views/user/profile.html',
            controller: 'ProfileCtrl',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            }
        })

        .state('main', {
            abstract: true,
            url: '/main',
            templateUrl: 'views/main/template.html',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
                //currentUserImage : function(ResourceService) {
                //    return ResourceService.getCurrentUserImage();
                //}//,
                //authenticate: authenticate
            }
        })
        .state('main.home', {
            url: '/prerequisite',
            templateUrl: 'views/main/prerequisite.html',
            controller: 'MainHomeCtrl'
        })

        .state('organization', {
            url: '/organization',
            templateUrl: 'views/organization/organization.html',
            controller: 'OrganizationHomeCtrl',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            }
        })

        .state('dashboard', {
            url: '/dashboard',
            templateUrl: 'views/dashboard/dashboard.html',
            controller: 'DashboardCtrl'
        })


        .state('prerequisite', {
            //abstract: true,
            url: '/prerequisite',
            templateUrl: 'views/prerequisite/prerequisite.tmpl.html',
            controller: 'PrerequisiteCtrl',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                },
                selectedOrganization: function (ResourceService) {
                    return ResourceService.getSelectedOrganization();
                },
            }
        })

        .state('prerequisite.layout', {
            url: '/layout',
            templateUrl: 'views/prerequisite/layout/layout.html',
            controller: 'LayoutCtrl'
        })

        .state('prerequisite.water-supply', {
            url: '/waterSupply',
            templateUrl: 'views/prerequisite/waterSupply/waterSupply.html',
            controller: 'WaterSupplyCtrl'
        })

        .state('prerequisite.air-conditioning', {
            url: '/airConditioning',
            templateUrl: 'views/prerequisite/airConditioning/airConditioning.html',
            controller: 'AirConditioningCtrl'
        })

        .state('prerequisite.cleaning', {
            url: '/cleaning',
            templateUrl: 'views/prerequisite/cleaning/cleaning.html',
            controller: 'CleaningCtrl'
        })

        .state('prerequisite.waste-disposal', {
            url: '/wasteDisposal',
            templateUrl: 'views/prerequisite/wasteDisposal/wasteDisposal.html',
            controller: 'WasteDisposalCtrl'
        })

        .state('prerequisite.equipment', {
            url: '/equipment',
            templateUrl: 'views/prerequisite/equipment/equipment.html',
            controller: 'EquipmentCtrl'
        })

        .state('prerequisite.pestControl', {
            url: '/pestControl',
            templateUrl: 'views/prerequisite/pestControl/pestControl.html',
            controller: 'PestControlCtrl'
        })

        .state('prerequisite.staffHygiene', {
            url: '/staffHygiene',
            templateUrl: 'views/prerequisite/staffHygiene/staffHygiene.html',
            controller: 'StaffHygieneCtrl'
        })

        .state('prerequisite.packaging', {
            url: '/packaging',
            templateUrl: 'views/prerequisite/packaging/packaging.html',
            controller: 'PackagingCtrl'
        })
        
        .state('prerequisite.flows', {
            url: '/flows',
            templateUrl: 'views/prerequisite/flows/flows.html',
            controller: 'FlowsCtrl'
        })


        .state('prerequisite.ccp', {
            url: '/ccp',
            templateUrl: 'views/ccp/ccp.html',
            controller: 'CCPCtrl'
        })

        .state('user', {
            //abstract: true,
            url: '/user',
            templateUrl: 'views/user/person.tmpl.html',
            controller: function($scope, ResourceService) {
                $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                $scope.$on('resourceChange', function () {
                    $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                });
            },
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            }
        })
        .state('user.home', {
            url: '/home',
            templateUrl: 'views/user/home/user.home.html',
            controller: 'PersonHomeCtrl'
        })
        .state('user.role', {
            url: '/role',
            templateUrl: 'views/user/role/role.home.html',
            controller: 'RoleHomeCtrl'
        })
        .state('user.organization', {
            url: '/organization',
            templateUrl: 'views/user/organization/organization.home.html',
            controller: 'OrganizationHomeCtrl'
        })
        .state('user.profile', {
            url: '/profile',
            templateUrl: 'views/user/profile/profile.home.html',
            controller: 'ProfileHomeCtrl'
        })
        .state('user.supplier', {
            url: '/supplier',
            templateUrl: 'views/user/supplier/supplier.home.html',
            controller: 'SupplierHomeCtrl'
        })

        .state('task', {
            //abstract: true,
            url: '/task',
            templateUrl: 'views/task/task.tmpl.html',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            }
        })
        .state('task.prerequisite', {
            url: '/prerequisite',
            templateUrl: 'views/task/prerequisite/task.prerequisite.html',
        })

        .state('task.ccp', {
            url: '/ccp',
            templateUrl: 'views/task/ccp/task.ccp.html',
        })

        .state('task.oprp', {
            url: '/oprp',
            templateUrl: 'views/task/oprp/task.oprp.html',
        })
        /*
         .state('processCheck', {
         abstract: true,
         url: '/processCheck',
         templateUrl: 'views/processCheck/processCheck.tmpl.html',
         resolve: {
         currentUser: function (ResourceService) {
         return ResourceService.getCurrentUser();
         },
         currentOrganization : function(ResourceService) {
         return ResourceService.getCurrentOrganization();
         }
         }
         })
         .state('processCheck.prerequisite', {
         url: '/prerequisite',
         templateUrl: 'views/processCheck/prerequisite/processCheck.prerequisite.html',
         controller: 'ProcessCheckHomeCtrl'
         })
         */

        .state('audit', {
            //abstract: true,
            url: '/audit',
            templateUrl: 'views/audit/audit.tmpl.html',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            },
            controller: function ($scope, $log, APIService, ResourceService) {

                $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                $scope.$on('resourceChange', function () {
                    $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                });

                $scope.$on('Noncompliance-update', function () {
                    $log.info('Noncompliance-update');
                    init();
                });

                $scope.count = {};

                function init() {

                    if(!$scope.selectedOrganization){
                        return;
                    }

                    APIService.getNoncompliancesByOrganizationId($scope.selectedOrganization.id).then(
                        function (data) {
                            $scope.count.closed = data.filter(function (n) {
                                return n.closeDate != null;
                            }).length;

                            $scope.count.opened = data.filter(function (n) {
                                return n.closeDate == null;
                            }).length;
                        }
                    );
                }

                init();

            }
        })
        .state('audit.system', {
            url: '/system',
            templateUrl: 'views/audit/system/audit.system.html',
            controller: 'AuditSystemCtrl'
        })

        .state('audit.process', {
            url: '/process',
            templateUrl: 'views/audit/process/audit.process.html',
            controller: 'AuditProcessCtrl'
        })

        .state('audit.planning', {
            url: '/planning',
            templateUrl: 'views/audit/planning/audit.planning.html',
            controller: 'AuditPlanningCtrl'
        })


        .state('noncompliance', {
            //abstract: true,
            url: '/noncompliance',
            templateUrl: 'views/noncompliance/noncompliance.tmpl.html',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            },
            controller: function($scope, ResourceService, APIService) {

                $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                $scope.$on('resourceChange', function () {

                    var changedSelectedOrganization = ResourceService.getSelectedOrganization();
                    if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
                        $scope.selectedOrganization = changedSelectedOrganization;
                        init();
                    }

                });

                $scope.count = {};

                $scope.$on('Noncompliance-update', function () {
                    init();
                });

                function init() {

                    if(!$scope.selectedOrganization){
                        return;
                    }

                    APIService.getNoncompliancesByOrganizationId($scope.selectedOrganization.id).then(
                        function (data) {
                            $scope.count.closed = data.filter(function (n) {
                                return n.closeDate != null;
                            }).length;

                            $scope.count.opened = data.filter(function (n) {
                                return n.closeDate == null;
                            }).length;
                        }
                    );
                }

                init();
                
            }

        })

        .state('noncompliance.home', {
            url: '/home',
            templateUrl: 'views/noncompliance/home/noncompliance.home.html',
            controller: 'NoncomplianceCtrl'
        })

        .state('riskAnalysis', {
            //abstract: true,
            url: '/riskAnalysis',
            templateUrl: 'views/danger/danger.tmpl.html',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            },
            controller: function($scope, ResourceService) {

                $scope.selectedOrganization = ResourceService.getSelectedOrganization();

                $scope.$on('resourceChange', function () {
                    $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                });

            }
        })

        .state('riskAnalysis.home', {
            url: '/home',
            templateUrl: 'views/danger/home/danger.home.html',
            controller: 'RiskAnalysisCtrl'
        })


        .state('haccp', {
            //abstract: true,
            url: '/haccp',
            templateUrl: 'views/haccp/haccp.tmpl.html',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            },
            controller: function($scope, ResourceService) {

                $scope.selectedOrganization = ResourceService.getSelectedOrganization();

                $scope.$on('resourceChange', function () {

                    var changedSelectedOrganization = ResourceService.getSelectedOrganization();
                    if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization) && changedSelectedOrganization) {
                        $scope.selectedOrganization = changedSelectedOrganization;
                        init();
                    }

                });

            }
        })

        .state('haccp.home', {
            url: '/home',
            templateUrl: 'views/haccp/home/haccp.home.html',
            controller: 'HaccpCtrl'
        })


        .state('data', {
            //abstract: true,
            url: '/data',
            templateUrl: 'views/data/data.tmpl.html',
            controller: 'DataCtrl',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            }
        })
        .state('data.procedure', {
            url: '/procedure',
            templateUrl: 'views/procedure/data/procedure.data.html',
            controller: 'ProcedureCtrl'
        })

        .state('data.systemCheck', {
            url: '/systemCheck',
            templateUrl: 'views/systemCheck/data/systemCheck.data.html',
            controller: 'SystemCheckCtrl'
        })

        .state('data.processCheck', {
            url: '/processCheck',
            templateUrl: 'views/processCheck/data/processCheck.data.html',
            controller: 'ProcessCheckCtrl'
        })

        .state('data.danger', {
            url: '/danger',
            templateUrl: 'views/danger/data/danger.data.html',
            controller: 'DangerCtrl'
        })

        .state('data.floor', {
            url: '/floor',
            templateUrl: 'views/floor/data/floor.data.html',
            controller: 'FloorCtrl'
        })

        .state('data.relatedFrequency', {
            url: '/relatedFrequency',
            templateUrl: 'views/data/relatedFrequency.html',
            controller: 'RelatedFrequencyCtrl'
        })

        .state('data.analysisParameters', {
            url: '/analysisParameters',
            templateUrl: 'views/sampling/analysisParameters.data.html',
            controller: 'AnalysisParametersCtrl'
        })

        .state('data.analysisParameterValues', {
            url: '/analysisParameterValues',
            templateUrl: 'views/sampling/analysisParameterValues.data.html',
            controller: 'AnalysisParameterValuesCtrl'
        })

        .state('data.riskClasses', {
            url: '/riskClasses',
            templateUrl: 'views/data/riskClasses.html',
            controller: 'RiskClasses'
        })

        .state('data.equipmentTypes', {
            url: '/equipmentTypes',
            templateUrl: 'views/data/equipmentTypes.html',
            controller: 'EquipmentTypes'
        })

        .state('data.waterSupplyTypes', {
            url: '/waterSupplyTypes',
            templateUrl: 'views/data/waterSupplyTypes.html',
            controller: 'WaterSupplyType'
        })

        .state('data.wasteDisposalTypes', {
            url: '/wasteDisposalTypes',
            templateUrl: 'views/data/wasteDisposalTypes.html',
            controller: 'WasteDisposalType'
        })

        .state('data.airConditioningTypes', {
            url: '/airConditioningTypes',
            templateUrl: 'views/data/airConditioningTypes.html',
            controller: 'AirConditioningType'
        })

        .state('data.pestControlTypes', {
            url: '/pestControlTypes',
            templateUrl: 'views/data/pestControlTypes.html',
            controller: 'PestControlType'
        })

        .state('data.materialCategories', {
            url: '/materialCategories',
            templateUrl: 'views/data/materialCategories.html',
            controller: 'MaterialCategoriesCtrl'
        })

        .state('data.food', {
            url: '/food',
            templateUrl: 'views/data/food.html',
            controller: 'FoodCtrl'
        })

        .state('training', {
            //abstract: true,
            url: '/training',
            templateUrl: 'views/training/training.tmpl.html',
            controller: function($scope, ResourceService) {
                $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                $scope.$on('resourceChange', function () {
                    $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                });
            },
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            }
        })
        .state('training.course', {
            url: '/course',
            templateUrl: 'views/training/course/training.course.html',
            controller: 'TrainingCourseCtrl'
        })

        .state('training.lesson', {
            url: '/lesson',
            templateUrl: 'views/training/lesson/training.lesson.html',
            controller: 'TrainingLessonCtrl'
        })

        .state('print', {
            //abstract: true,
            url: '/print',
            templateUrl: 'views/print/print.tmpl.html',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            },
            controller: function($scope, ResourceService) {
                $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                $scope.$on('resourceChange', function () {
                    $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                });
            }
        })
        .state('print.home', {
            url: '/home',
            templateUrl: 'views/print/print.home.html',
            controller: 'PrintHomeCtrl'
        })

        .state('drawChart', {
            url: '/drawChart',
            templateUrl: 'views/drawChart/drawChart.html',
            controller: 'DrawChartCtrl'
        })

        .state('drawChart.home', {
            url: '/home',
            templateUrl: 'views/drawChart/home/drawChart.home.html',
            controller: 'DrawChartCtrl'
        })

        .state('setting', {
            //abstract: true,
            url: '/setting',
            templateUrl: 'views/setting/setting.tmpl.html',
            resolve: {
                currentUser: function (ResourceService) {
                    return ResourceService.getCurrentUser();
                },
                currentOrganization: function (ResourceService) {
                    return ResourceService.getCurrentOrganization();
                }
            }
        })
        .state('setting.data', {
            url: '/data',
            templateUrl: 'views/setting/data/setting.data.html',
            controller: 'SettingDataCtrl'
        })

        .state('setting.prerequisite', {
            url: '/prerequisite',
            templateUrl: 'views/setting/prerequisite/setting.prerequisite.html',
            controller: 'SettingPrerequisiteCtrl'
        })


    ;

    function authenticate($q, user, $state, $timeout) {
        // console.log("authenticate");
        var isAuth = true;
        if (isAuth) {
            // Resolve the promise successfully
            return $q.when();
        } else {
            // The next bit of code is asynchronously tricky.

            $timeout(function () {
                // This code runs after the authentication promise has been rejected.
                // Go to the log-in page
                $state.go('login');
            });

            // Reject the authentication promise to prevent the state from loading
            return $q.reject();
        }
    }
}
function run($rootScope, $document, $location, $state, $stateParams, $translate, $compile, APIService, ResourceService, Command, Shape, ENV) {

    $rootScope.appName = ENV.appName;
    var currentLanguage = ResourceService.getCurrentLanguage();
    ResourceService.setCurrentLanguage(currentLanguage);
/*
    if (!angular.element('#google-map').length) {
        var keyEl = '<script id="google-map" type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=' +
            ENV.googleApiKey + '&libraries=visualization,places&language=' + currentLanguage + '"></script>';
        angular.element(document.querySelector('body')).append($compile(keyEl)($rootScope));
    }
    ;
  */
    $rootScope.$on('event.unauthorized', function () {
        $state.go('login');
    });
    $rootScope.$on('event.forbidden', function () {
        $state.go('login');
    });
    $rootScope.$on('event.notFound', function () {
//    $state.go('404');
    });
    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute, previousRoute) {
        $document.scrollTo(0, 0);
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        if (error === 'Unauthorized') {
            $state.go('403', null, {reload: true});
        }
        if (error === 'Forbidden') {
            $state.go('login', null, {reload: true});
        }
    });

    //Theme Flatify specific
    $rootScope.isFullScreenPage = function () {
        var path, ref, specificPages;
        path = $location.path();
        specificPages =
            ['/404', '/500', '/welcome', '/login', '/lock-screen'];
        return specificPages.indexOf(path) >= 0;
        /*      return (ref = specificPages.indexOf(path) >= 0) != null ? ref : {
         1: -1
         };*/
    };

    $rootScope.Shape = {
        CIRCLE: Shape.CIRCLE,
        RECTANGLE: Shape.RECTANGLE
    }

    $rootScope.Command = {
        action: Command.action
    }
}
