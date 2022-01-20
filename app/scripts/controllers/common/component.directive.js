'use strict';

/**
 * @ngdoc function
 * @name APP.directives:components
 * @description
 * # components
 * Directives of common components of the APP
 */
angular.module('APP')

    .directive('analysisChart', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                values: '=ngModel',
                title: '=',
                threshold: '='
            },
            require: 'ngModel',
            templateUrl: 'views/common/templates/analysisChart.tmpl.html',
            controller: function ($scope, $filter, $log) {

                $scope.labels = null;
                $scope.series = [$scope.title, 'Thr'];
                $scope.data = null

                $scope.options = {
                    scales: {
                        yAxes: [
                            {
                                id: 'y-axis-1',
                                type: 'linear',
                                display: true,
                                position: 'left'
                            },
                            {
                                id: 'y-axis-2',
                                type: 'linear',
                                display: false,
                            }
                        ]
                    }
                };

                function init() {
                    $scope.$watch('values', function (values) {
                        if (values) {

                            $scope.labels = values.map(function (v) {
                                return $filter('date')(v.date, 'dd/MM/yyyy');
                            });

                            $scope.data = [];
                            $scope.data.push(
                                values.map(function (v) {
                                    return v.value;
                                })
                            );
                            if ($scope.threshold != null) {
                                $scope.data.push(
                                    values.map(function () {
                                        return $scope.threshold;
                                    })
                                )
                            }
                        }
                    });
                }

                init();
            }
        };
    })

    .directive('datePicker', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                date: '=',
                minDate: '=',
                maxDate: '=',
                onChange: '&',
                isValid: '=',
                isRequired: '@'
            },
            controller: 'DatePickerCtrl',
            templateUrl: 'views/common/templates/datePicker.tmpl.html',
            link: function ($scope, $elt, $attr) {
                var initialize = function () {
                    if (!$scope.isRequired) $scope.isRequired = true;
                };
                initialize();
            }
        };
    })

    .directive('dateTimePicker', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                timestamp: '=',
                minDate: '='
            },
            controller: 'DateTimePickerCtrl',
            templateUrl: 'views/common/templates/dateTimePicker.tmpl.html'
        };
    })

    .directive('editableField', function () {
        return {
            restrict: "A",
            replace: true,
            scope: {
                value: '=',
                placeholder: '=',
                inline: "=",
                prefix: "="
            },
            controller: 'EditableFieldCtrl',
            templateUrl: 'views/common/templates/editableField.tmpl.html'
        };
    })

    .directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                console.log("+++++++", scope.$last);
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        };
    })

    .directive('uiRangeSlider', [
        function () {
            return {
                restrict: 'A',
                link: function (scope, ele) {
                    console.log("Directives............", ele);
                    return ele.slider();
                }
            };
        }
    ])

    .directive("fileInput", [function () {
        return {
            scope: {
                file: "=",
                fileData: "="
            },
            restrict: 'A',
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    console.log("onFileInput change: ", changeEvent);

                    scope.$apply(function () {
                        scope.file = changeEvent.target.files[0];
                    });

                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        console.log("onLoad:", loadEvent);
                        scope.$apply(function () {
                            scope.fileData = loadEvent.target.result;
                        });
                    };
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        };
    }])

    .directive('echarts', function ($window) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                options: '=options'
            },
            link: function (scope, element, attrs) {
                var chart, options;
                chart = echarts.init(element[0], 'macarons');
                createChart(scope.options);
                function createChart(options) {
                    if (!options) return;
                    chart.clear();
                    chart.setOption(options);
                    // scope.$emit('create', chart);
                    angular.element($window).bind('resize', function () {
                        chart.resize();
                    });
                }

                scope.$watch('options', function (newVal, oldVal) {
                    if (angular.equals(newVal, oldVal)) return;
                    createChart(newVal);
                })
            }
        }
    })

    .directive('fileUploaderOld', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('change', function () {

                    var reader = new FileReader();
                    reader.onloadend = function (e) {
                        var f = {
                            file: {
                                name: element[0].files[0].name,
                                size: element[0].files[0].size,
                                type: element[0].files[0].type
                            },
                            content: e.target.result
                        }
                        $parse(attrs.fileModel).assign(scope, f);
                        scope.$apply();
                    }
                    reader.readAsDataURL(element[0].files[0]);
                });
            }
        };
    }])

    .directive('fileTextUploader', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('change', function () {

                    console.log("imput change");

                    var reader = new FileReader();
                    reader.onloadend = function (e) {


                        var f = {
                            file: {
                                name: element[0].files[0].name,
                                size: element[0].files[0].size,
                                type: element[0].files[0].type
                            },
                            content: e.target.result
                        }
                        $parse(attrs.fileModel).assign(scope, f);
                        scope.$apply();
                    }
                    reader.readAsText(element[0].files[0]);
                });
            }
        };
    }])

    .directive('fileUploader', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            scope: {
                onFileLoaded: '&',

            },
            controller: function ($scope, $log, APIService) {
                $scope.setFileData = function (f) {
                    $scope.onFileLoaded({'file': f});
                };
            },

            link: function (scope, element, attrs) {
                element.bind('change', function () {
                    var reader = new FileReader();
                    reader.onloadend = function (e) {
                        var f = {
                            file: {
                                name: element[0].files[0].name,
                                size: element[0].files[0].size,
                                type: element[0].files[0].type
                            },
                            content: e.target.result
                        }

                        scope.setFileData(f);
                        //$parse(attrs.fileData).assign(scope, f);
                        //scope.$apply();
                    }
                    reader.readAsDataURL(element[0].files[0]);
                });
            }
        };
    }])

    .directive('attachment', [function () {
        return {
            restrict: 'EA',
            scope: {
                onFileUploaded: '&',
                tipologia: '@',
                attachment: '=ngModel'
            },
            require: 'ngModel',
            templateUrl: 'views/common/templates/attachment.tmpl.html',
            link: function (scope, element, attrs, ctrl) {
                scope.required = (attrs.required != null);
                scope.readonly = (attrs.readonly != null);
                scope.name = (attrs.name);
                scope.ctrl = ctrl;
            },
            controller: function ($scope, $log, $timeout, Attachment, UtilsService, ResourceService, APIService, ENV) {

                $scope.MAX_SIZE = 1024000; //1MB
                $scope.uploading = false;
                $scope.downloadLink = null;
                $scope.mode = 'file'; // 'link';

                if ($scope.attachment) {
                    $scope.mode = $scope.attachment.link ? 'link' : 'file';
                }

                $scope.clear = function () {
                    $scope.attachment = null;
                    $scope.link = null;
                    $scope.ctrl.$setValidity('fileSize', true);
                    $scope.ctrl.$setValidity('reachability', true);
                    $scope.ctrl.$setPristine();

                    /*
                     $scope.onFileUploaded({file: {
                     id: null
                     }});
                     */
                };
                /*
                 $scope.$watch('uploadedFile', function(value){
                 if(value){
                 $scope.downloadLink = ENV.hostEndpoint+ENV.applicationName + 'DownloadAllegatoServlet?idAllegato=' + value.id + '&username=' + ResourceService.getCurrentUser().userName + '&key=' + value.key;
                 }
                 });
                 */
                $scope.onLinkChange = function (link) {
                    $log.info("onLinkChange:", link);

                    if (!link) {
                        return;
                    }

                    $scope.ctrl.$setDirty();

                    var attachment = Attachment.parse({
                        link: link
                    });

                    $scope.attachment = attachment;

                    /*
                     UtilsService.checkRemoteLinkReachability(link).then(
                     function success(){
                     var attachment = Attachment.parse({
                     link: link
                     });

                     $scope.attachment = attachment;
                     $scope.ctrl.$setValidity('reachability', true);

                     $log.info("SetValidity TRUE");
                     },
                     function error() {

                     $scope.ctrl.$setValidity('reachability', false);
                     $log.info("SetValidity FALSE");
                     }
                     );
                     */

                };

                $scope.onFileLoaded = function (file) {
                    $log.info("onFileLoaded:", file);
                    $scope.ctrl.$setDirty();
                    $scope.uploading = false;
                    if (file) {


                        $log.info("FILE:", file);

                        var attachment = Attachment.parse(
                            {
                                filename: file.file.name,
                                description: file.file.name,
                                fileSize: file.file.size,
                                mimeType: file.file.type || 'application/octet-stream',
                                data: file.content.substring(file.content.indexOf('base64,') + 7),
                                type: "test"
                            }
                        );

                        if (attachment.fileSize > $scope.MAX_SIZE) {
                            $scope.ctrl.$setValidity('fileSize', false);
                        } else {
                            $scope.ctrl.$setValidity('fileSize', true);
                        }

                        $scope.uploading = true;
                        $scope.$apply();

                        $log.info("Creating attachment: %O", attachment);
                        APIService.createAttachment(attachment).then(
                            function success(data) {

                                attachment.id = data.id;

                                $scope.uploading = false;
                                $scope.attachment = attachment;

                                //$scope.$apply();
                            });

                        /*
                         APIService.creaAllegato(data).then(
                         function successCallback(data) {
                         $log.info("success!:", data);
                         */


                        /*          },
                         function errorCallback() {

                         }
                         );*/


                    }
                };

                function init() {

                }

                init();
            }
        };
    }])

    .directive('pager', [function () {
        return {
            restrict: 'EA',
            scope: {
                items: '=',
                onPageChanged: '&'
            },
            templateUrl: 'views/common/templates/pager.tmpl.html',
            controller: function ($scope, $log, $timeout, ResourceService) {

                $scope.Math = window.Math;

                $scope.pages = 0;
                $scope.pagesCap = 5;

                $scope.pageSize = 10;

                $scope.currentPage = 0;

                $scope.$on('filtersChanged', function () {

                    $log.info(':filtersChanged');
                    $timeout(function () {
                        init();
                    }, 1);

                });

                $scope.onPageSelect = function (pageIndex) {

                    $scope.currentPage = pageIndex;

                    $scope.onPageChanged({page: pageIndex});

                };

                $scope.onPagePrev = function () {

                    if ($scope.currentPage != 0) {

                        $scope.currentPage = $scope.currentPage - 1;
                        $scope.onPageChanged({page: $scope.currentPage});

                    }

                };

                $scope.onPageNext = function () {

                    if ($scope.currentPage != ($scope.pages.length - 1)) {

                        $scope.currentPage = $scope.currentPage + 1;
                        $scope.onPageChanged({page: $scope.currentPage});

                    }

                };

                $scope.show = function (index) {

                    var result = false;
                    var filter = null;

                    var pagesCap = Math.floor($scope.pagesCap / 2);

                    if ($scope.currentPage == 0) {
                        filter = index < $scope.currentPage + $scope.pagesCap;
                    } else if ($scope.currentPage == $scope.pages.length - 1) {
                        filter = $scope.currentPage - $scope.pagesCap < index;
                    } else if ($scope.currentPage == 1) {
                        filter = index < $scope.currentPage - 1 + $scope.pagesCap;
                    } else if ($scope.currentPage == $scope.pages.length - 2) {
                        filter = $scope.currentPage + 1 - $scope.pagesCap < index;
                    } else {
                        filter = $scope.currentPage - pagesCap <= index && index <= $scope.currentPage + pagesCap;
                    }


                    if (filter) {

                        result = true;

                    }


                    return result;

                };

                function init() {

                    if ($scope.items) {

                        $scope.pages = new Array(Math.ceil($scope.items.length / $scope.pageSize));

                        $scope.onPageSelect(0);

                    }

                }

                init();

            }

        };

    }])




/* .directive('dateTimePicker', function($rootScope) {

 return {
 require: '?ngModel',
 restrict: 'AE',
 scope: {
 pick12HourFormat: '@',
 language: '@',
 useCurrent: '@',
 location: '@',
 onChange: '&',
 ngModel: '=value'
 },
 link: function (scope, elem, attrs) {


 elem.datetimepicker({
 pick12HourFormat: scope.pick12HourFormat,
 useCurrent: scope.useCurrent,
 locale: 'it-IT',
 format: 'DD-MM-YYYY HH:mm'
 })

 //Local event change
 elem.on('blur', function () {

 /!*
 console.info('this', this);
 console.info('scope', scope);
 console.info('attrs', attrs);


 *!/


 console.log('ngmodel: ', scope.value);

 console.log("elem: ", elem[0].value);
 var m = moment(elem[0].value, "DD-MM-YYYY");
 console.log("moment:", m);

 console.log("m format:", m.unix());

 var d = new Date( m.unix() * 1000);
 console.log("elem value:" ,d);


 scope.value = d;

 //scope.onChange({date : d});
 //scope.ngModel = new Date();//elem.data("DateTimePicker").getDate().format());

 /!*!// returns moments.js format object
 scope.dateTime = new Date(elem.data("DateTimePicker").getDate().format());
 // Global change propagation

 $rootScope.$broadcast("emit:dateTimePicker", {
 location: scope.location,
 action: 'changed',
 dateTime: scope.dateTime,
 example: scope.useCurrent
 });
 scope.$apply();*!/
 })
 }
 }
 })*/

;
