'use strict';

angular.module('APP')
.factory('PrintService', ['$rootScope', '$compile', '$http', '$timeout', '$q', '$document', '$window', '$log', '$filter', 'ResourceService', 'APIService',
    function ($rootScope, $compile, $http, $timeout, $q, $document,  $window, $log, $filter, ResourceService, APIService) {

        var TEMPLATE_DIR = '/templates/';

        var FOOTER_TEMPLATE = '<div class="text-center"><span>Nome azienda  - nome documento</span>'+
            '<br/><span>pagina @@pageNumber@@</span></div>';

/*
        $window.onafterprint = function(){
            $log.info("Printing completed...");
        }

        var beforePrint = function() {
            console.log('Functionality to run before printing.');
        };

        var afterPrint = function() {
            console.log('Functionality to run after printing');
        };

        if ($window.matchMedia) {
            var mediaQueryList = $window.matchMedia('print');
            mediaQueryList.addListener(function(mql) {
                if (mql.matches) {
                    beforePrint();
                } else {
                    afterPrint();
                }
            });
        }
*/
        var _printContent =  {
            header: null,
            footer: null,
            content: null
        }


        /* ---- initialize PrintHAF ---- */


        PrintHAF.init({
            domID: 'print-container', // The id of the HTML element that contains the content to be printed
            size: 'letter', // Dimensions when printed (letter, legal, or tabloid), takes precedence over width and height
            width: 816, // Width when printed (pixels), does not apply if size is set
            height: 1056, // Height when printed (pixels), does not apply if size is set
            marginTop: 0, // Margin when printed (pixels), defaults to 0 if omitted
            marginBottom: 0, // Margin when printed (pixels), defaults to 0 if omitted
            marginLeft: 48, // Margin when printed (pixels), defaults to 0 if omitted
            marginRight: 48, // Margin when printed (pixels), defaults to 0 if omitted
            createHeaderTemplate: function(pageNumber) { // Optional, called every time a page is created, should return a DOM node
                var header = document.createElement('div');
                //header.innerHTML = 'HEADER ' + pageNumber;

                return header;
            },
            createFooterTemplate: function(pageNumber) { // Optional, called every time a page is created, should return a DOM node
                var footer = document.createElement('div');
                var html = FOOTER_TEMPLATE.replace('@@pageNumber@@', pageNumber);
                footer.innerHTML = html;

                return footer;
            },
            before: function() { //Optional, runs before printing
                // Do any necessary preparations for printing
                $rootScope.printContent = _printContent.content;
            },
            after: function() { //Optional, runs after printing
                // Clean up any preparations for printing
                $rootScope.printContent = null;
            }
        });


        var _onPrintFinished = function() {
            var deferred = $q.defer();

            //$window.onbeforeprint = beforePrint;
            $window.onafterprint = function () {
                $log.info("=========================================== onafterprint =================================");
                deferred.resolve();
            };

            $window.onbeforeprint = function () {
                $log.info("=========================================== onbeforeprint =================================");
                deferred.resolve();
            };

            /*


             if ($window.matchMedia) {
             var mediaQueryList = $window.matchMedia('print');
             mediaQueryList.addListener(function(mql) {
             if (mql.matches) {
             beforePrint();
             } else {
             afterPrint();
             deferred.resolve();
             }
             });
             } else {
             $timeout(function(){ deferred.resolve()});
             }

             */

            return deferred.promise;
        }

        var printHtml = function (html) {
            var deferred = $q.defer();

            // var hiddenFrame = $('<iframe style="display: none"></iframe>').appendTo('body')[0];
            $document.find('body').eq(0).append('<iframe style="display: none"></iframe>');
            var hiddenFrame = $document.find('iframe').eq(0)[0];

            /* hiddenFrame.contentWindow.printAndRemove = function () {
             hiddenFrame.contentWindow.print();
             // $(hiddenFrame).remove();
             // hiddenFrame.parentNode.removeChild(hiddenFrame);
             deferred.resolve();
             };*/

            var htmlContent = "<!doctype html>" +
                "<html>" +
                '<body onload="printIframe();">' +
                html +
                '<script type="text/javascript">function printIframe(){document.execCommand("print", false, null);return;}</script>'+
                '</body>' +
                "</html>";

            //var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            //doc.write(htmlContent);

            setTimeout(function(){
                deferred.resolve();
            }, 500);

            //doc.close();
            return deferred.promise;
        };

        var openNewWindow = function (html) {
            var newWindow = window.open("printTest.html");
            newWindow.addEventListener('load', function () {
                $(newWindow.document.body).html(html);
            }, false);
        };

        var _printHTMLContent = function(templateFile, data) {
            var deferred = $q.defer();
            _buildContent(templateFile,data).then(function(content){
                $rootScope.printContent = content;
                _printContent.content = content;
                PrintHAF.print();
                $timeout(function(){

                   // printJS({ printable: 'print-container', type: 'html', font: 'Lato'});
                   // $rootScope.printContent = null;
                    deferred.resolve();
                });
            }, deferred.reject );
            return deferred.promise;
        }

        var _buildContent = function(templateFile, data) {
            var deferred = $q.defer();
            var templateUrl = TEMPLATE_DIR + templateFile;
            var printScope = $rootScope.$new();
            angular.extend(printScope, data);

            var waitForRender = function (element) {

                $log.info("waitForRender");

                if (printScope.$$phase || $http.pendingRequests.length) {
                    $timeout(function () {
                        waitForRender(element);
                    }, 200);

                    return;
                } else {
                    var html = element.html();
                    $log.info("html:", html);
                    deferred.resolve(html);
                    printScope.$destroy();
                }
            };

            $http.get(templateUrl).then(function (templateData) {
                var template = templateData.data;
                var element = $compile(angular.element('<div>' + template + '</div>'))(printScope);
                waitForRender(element);
            }, deferred.reject);

            return deferred.promise;
        };

        var _print = function (templateFile, data) {
            $rootScope.isBeingPrinted = true;

            var templateUrl = TEMPLATE_DIR + templateFile;

            $http.get(templateUrl).then(function (templateData) {
                var template = templateData.data;
                var printScope = $rootScope.$new();
                angular.extend(printScope, data);

                $log.info("printScope:", printScope);
                // var element = $compile($('<div>' + template + '</div>'))(printScope);
                var element = $compile(angular.element('<div>' + template + '</div>'))(printScope);

                $log.info("element:", element);

                var renderAndPrintPromise = $q.defer();
                var waitForRenderAndPrint = function () {
                    if (printScope.$$phase || $http.pendingRequests.length) {
                        $timeout(waitForRenderAndPrint, 1000);
                    } else {

                        $rootScope.printContent = element.html();

                        $log.info("html:", element.html());

                        PrintHAF.print();
                        /*
                         // Replace printHtml with openNewWindow for debugging
                         printHtml(element.html()).then(function () {
                         var hiddenFrame = $document.find('iframe').eq(0)[0];
                         hiddenFrame.parentNode.removeChild(hiddenFrame);
                         $rootScope.isBeingPrinted = false;
                         renderAndPrintPromise.resolve();
                         });
                         */
                        printScope.$destroy();
                    }
                    return renderAndPrintPromise.promise;
                };
                // spinner.forPromise(waitForRenderAndPrint());
                waitForRenderAndPrint();
            });
        };

        var printFromScope = function (templateUrl, scope, afterPrint) {
            $rootScope.isBeingPrinted = true;
            $http.get(templateUrl).then(function (response) {
                var template = response.data;
                var printScope = scope;
                var element = $compile($('<div>' + template + '</div>'))(printScope);
                var renderAndPrintPromise = $q.defer();
                var waitForRenderAndPrint = function () {
                    if (printScope.$$phase || $http.pendingRequests.length) {
                        $timeout(waitForRenderAndPrint);
                    } else {
                        printHtml(element.html()).then(function () {
                            $rootScope.isBeingPrinted = false;
                            if (afterPrint) {
                                afterPrint();
                            }
                            renderAndPrintPromise.resolve();
                        });
                    }
                    return renderAndPrintPromise.promise;
                };
                // spinner.forPromise(waitForRenderAndPrint());
                waitForRenderAndPrint();
            });
        };

        var printPdf = function (url) {
            var iframe = this._printIframe;
            if (!this._printIframe) {
                iframe = this._printIframe = document.createElement('iframe');
                document.body.appendChild(iframe);

                iframe.style.display = 'none';
                iframe.onload = function() {
                    setTimeout(function() {
                        iframe.focus();
                        iframe.contentWindow.print();
                    }, 1);
                };
            }

            iframe.src = url;
        };

        var downloadAndPrintPdf = function(url){

            $http({
                url: url,
                method: 'GET',
                headers: {
                    'Content-type': 'application/pdf'
                },
                responseType: 'arraybuffer'
            }).success(function (data, status, headers, config) {

                var pdfFile = new Blob([data], {
                    type: 'application/pdf'
                });

                var pdfUrl = URL.createObjectURL(pdfFile);

                try{
                    printJS(pdfUrl);
                } catch(e) {
                    $log.error(e);

                    var printWindow = $window.open(pdfUrl);
                    printWindow.print();
                }


                //window.open(pdfUrl);
                //var printwWindow = $window.open(pdfUrl);
                //printwWindow.print();
            }).error(function (data, status, headers, config) {
                $log.error("Errore di recupero PDF");
            });
        };

        function printError(err){
            $log.error("Error during printing process", err);
        };

        var _printOrganizationDetails = function(data){
            var deferred = $q.defer();
            if(data != null) {
                _printHTMLContent('organization.print.tmpl.html', data).then(
                    deferred.resolve, deferred.reject
                );
            } else {
                $timeout(function(){
                    deferred.reject();
                })
            }

            return deferred.promise;
        };

        var _printDelega = function(organization) {

            var deferred = $q.defer();

            var data = {
                organization: organization || ResourceService.getSelectedOrganization(),
                currentUser: ResourceService.getCurrentUser(),
                date: $filter('date')( new Date(), 'dd/MM/yyyy')
            };
            if(data != null) {

                _printHTMLContent('delega.print.tmpl.html', data).then(
                    deferred.resolve, deferred.reject
                )
             /*
                _buildContent('delega.print.tmpl.html', data).then(function(content) {
                    _printContent.content = content;
                    PrintHAF.print();
                }, printError);
                */
            } else {
                $timeout(function(){
                    deferred.reject();
                })
            }

            return deferred.promise;
        };

        var _printStaff = function(organization) {
            var deferred = $q.defer();


            var org = organization || ResourceService.getSelectedOrganization();

            var userRoles, people, trainings, prerequisites, monitorings, outcomes  = null;

            var items = [];

            APIService.getRolesByOrganizationId(org.id).then(
                function (data) {

                    $log.info("Roles: %O", data);
                    userRoles = data;

                    APIService.getUsersByOrganizationId(org.id).then(
                        function (data) {

                            $log.info("Users: %O", data);
                            people = data.filter(function(p) { return p.organization.id == org.id;});

                            APIService.getTrainingsByOrganizationId(org.id).then(
                                function (data) {

                                    trainings = data;
                                    /*
                                    APIService.getStaffHygienesByOrganizationId(org.id).then(
                                        function (data) {

                                            $log.info("Staff hygienes: %O", data);
                                            prerequisites = data;

                                            APIService.getMonitoringsByOrganizationId(org.id).then(
                                                function (data) {

                                                    $log.info("Monitorings: %O", data);
                                                    monitorings = data;

                                                    var monitoringIds = (monitorings || []).map(function (monitoring) {
                                                        return monitoring.id;
                                                    });

                                                    APIService.recursiveCall(monitoringIds, APIService.getOutcomeByMonitoringId).then(
                                                        function success(data) {

                                                            $log.info("Outcomes: %O", data);
                                                            outcomes = data;
*/
                                                            people.forEach(function (p) {

                                                                var item = {};
                                                                item.user = p;
                                                                item.name = p.getFullName();
                                                                item.role = userRoles.find(function (r) {
                                                                    return r.id == p.role.id;
                                                                });

                                                                item.trainings = trainings.filter(function (t) {
                                                                    return t.participants && (t.participants.find(function (part) {
                                                                            return part.user.id == p.id;
                                                                        }) != null);
                                                                }).sort(function (a, b) {
                                                                    return b.insertTime - a.insertTime;
                                                                });
/*
                                                                var prerequisite = prerequisites.find(function (pre) {
                                                                    return pre.role.id == p.role.id;
                                                                });

                                                                item.monitorings = monitorings.filter(function (m) {
                                                                    return prerequisite && prerequisite.context.id == m.context.id;
                                                                });

                                                                item.outcomes = outcomes.sort(function (a, b) {
                                                                    return b.insertTime - a.insertTime;
                                                                });
*/
                                                                items.push(item);

                                                            });

                                                            _printHTMLContent('staff.print.tmpl.html', {items : items}).then(
                                                                deferred.resolve, deferred.reject );

                                                        });
                                                });
                                        });
             /*                   });
                        });
                });
      */      return deferred.promise;
        };


        var _printStaffTrainings = function(organization) {
            var deferred = $q.defer();
            var org = organization || ResourceService.getSelectedOrganization();

            var trainings, people, trainings, prerequisites, monitorings, outcomes  = null;

            var items = [];

            APIService.getTrainingsByOrganizationId(org.id).then(
                function (data) {

                    trainings = $filter('unique')(data.sort(function(a,b){
                        return a.date - b.date;
                    }), 'course.id');

                    $log.info("Trainings:", trainings);

                    _printHTMLContent('trainings.print.tmpl.html', {items : trainings}).then(
                        deferred.resolve, deferred.reject );

                });


            return deferred.promise;
        };

        return {

            onPrintFinished: function(){
                return _onPrintFinished();
            },
            sendEmailSearchResults: function( request ) {
                return _sendEmailSearchResults(request);
            },
            printSearchResults: function( request ) {
                return _printSearchResults(request);
            },
            printFromScope: printFromScope,

            printTest: function () {
                return _print('/template.print.tmpl.html');
            },
            printOrganizationDetails: function(organization) {
                return _printOrganizationDetails(organization);
            },
            printDelega: function(organization) {
                return _printDelega(organization);
            },
            printStaff: function(organization) {
                return _printStaff(organization);
            },
            printStaffTrainings: function(organization) {
                return _printStaffTrainings(organization);
            }
        };
    }]);