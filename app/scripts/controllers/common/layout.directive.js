(function () {
    'use strict';
    angular.module('app.layout').directive('imgHolder', [
        function() {
            return {
                restrict: 'A',
                link: function(scope, ele, attrs) {
                    return Holder.run({
                        images: ele[0]
                    });
                }
            };
        }
    ]).directive('customBackground', function() {
        return {
            restrict: "A",
            controller: [
                '$scope', '$element', '$location', function($scope, $element, $location) {
                    var addBg, path;
                    path = function() {
                        return $location.path();
                    };
                    addBg = function(path) {
                        $element.removeClass('body-home body-special body-tasks body-lock');
                        switch (path) {
                            case '/':
                                return $element.addClass('body-home');
                            case '/404':
                            case '/500':
                            case '/login':
                            case '/welcome':
                                return $element.addClass('body-special');
                            case '/lock-screen':
                                return $element.addClass('body-special body-lock');
                            case '/tasks':
                                return $element.addClass('body-tasks');
                        }
                    };
                    addBg($location.path());
                    return $scope.$watch(path, function(newVal, oldVal) {
                        if (newVal === oldVal) {
                            return;
                        }
                        return addBg($location.path());
                    });
                }
            ]
        };
    }).directive('uiColorSwitch', [
        function() {
            return {
                restrict: 'A',
                link: function(scope, ele, attrs) {
                    return ele.find('.color-option').on('click', function(event) {
                        var $this, hrefUrl, style;
                        $this = $(this);
                        hrefUrl = void 0;
                        style = $this.data('style');
                        if (style === 'loulou') {
                            hrefUrl = 'styles/main.css';
                            $('link[href^="styles/main"]').attr('href', hrefUrl);
                        } else if (style) {
                            style = '-' + style;
                            hrefUrl = 'styles/main' + style + '.css';
                            $('link[href^="styles/main"]').attr('href', hrefUrl);
                        } else {
                            return false;
                        }
                        return event.preventDefault();
                    });
                }
            };
        }
    ]).directive('toggleMinNav', [
        '$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                link: function(scope, ele, attrs) {
                    var $window, Timer, app, updateClass;
                    app = $('#app');
                    $window = $(window);
                    ele.on('click', function(e) {
                        if (app.hasClass('nav-min')) {
                            app.removeClass('nav-min');
                        } else {
                            app.addClass('nav-min');
                            $rootScope.$broadcast('minNav:enabled');
                        }
                        return e.preventDefault();
                    });
                    Timer = void 0;
                    updateClass = function() {
                        var width;
                        width = $window.width();
                        /*if (width < 768) {
                            return app.removeClass('nav-min');
                        }*/
                    };
                    return $window.resize(function() {
                        var t;
                        clearTimeout(t);
                        return t = setTimeout(updateClass, 300);
                    });
                }
            };
        }
    ]).directive('collapseNav', [
        function() {
            return {
                restrict: 'A',
                link: function(scope, ele, attrs) {
                    var $a, $aRest, $lists, $listsRest, app;
                    $lists = ele.find('ul').parent('li');
                    $lists.append('<i class="fa fa-caret-right icon-has-ul"></i>');
                    $a = $lists.children('a');
                    $listsRest = ele.children('li').not($lists);
                    $aRest = $listsRest.children('a');
                    app = $('#app');
                    $a.on('click', function(event) {
                        var $parent, $this;
                        if (app.hasClass('nav-min')) {
                            return false;
                        }
                        $this = $(this);
                        $parent = $this.parent('li');
                        $lists.not($parent).removeClass('open').find('ul').slideUp();
                        $parent.toggleClass('open').find('ul').slideToggle();
                        return event.preventDefault();
                    });
                    $aRest.on('click', function(event) {
                        return $lists.removeClass('open').find('ul').slideUp();
                    });
                    return scope.$on('minNav:enabled', function(event) {
                        return $lists.removeClass('open').find('ul').slideUp();
                    });
                }
            };
        }
    ]).directive('toggleOffCanvas', [
        function() {
            return {
                restrict: 'A',
                link: function(scope, ele, attrs) {
                    return ele.on('click', function() {
                        return $('#app').toggleClass('on-canvas');
                    });
                }
            };
        }
    ]).directive('slimScroll', [
        function() {
            return {
                restrict: 'A',
                link: function(scope, ele, attrs) {
                    return ele.slimScroll({
                        height: '100%'
                    });
                }
            };
        }
    ]).directive('goBack', [
        function() {
            return {
                restrict: "A",
                controller: [
                    '$scope', '$element', '$window', function($scope, $element, $window) {
                        return $element.on('click', function() {
                            return $window.history.back();
                        });
                    }
                ]
            };
        }
    ]).directive('uiSrefActiveIf', ['$state', function($state) {
      return {
        restrict: "A",
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
          var state = $attrs.uiSrefActiveIf;

          function update() {
            if ( $state.includes(state) || $state.is(state) ) {
              $element.addClass("active");
            } else {
              $element.removeClass("active");
            }
          }

          $scope.$on('$stateChangeSuccess', update);
          update();
        }]
      };
    }]);
})();
