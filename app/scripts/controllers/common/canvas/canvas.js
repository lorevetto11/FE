angular.module('APP')
    .controller('CanvasCtrl', function($rootScope, $scope, $log, $translate, $state, $interval, $uibModal,
                                       $timeout, $window, amMoment, notify, Command,
                                       PrerequisiteType, Layout, WaterSupply, Shape, Cleaning,
                                       APIService, ResourceService, EEquipment, UtilsService, Frequency, ENV) {

        var DEFAULT_RATIO = 3/4;

        var _context = null;
        var _canvasElement = null;

        var centerX;
        var centerY;
        var startX;
        var startY;
        var prevX;
        var prevY;
        var drawingElement = null;
        var movingElement = null;
        var selectedElement = null;

        $scope.onMouseDown = function(event){

            startX = event.offsetX;
            startY = event.offsetY;

            $log.info("onMouseDown: (" + startX + ','+ startY + ')');

            prevX = event.offsetX;
            prevY = event.offsetY;


            $log.info("canvas size: (" + _canvasElement.width + ','+ _canvasElement.height + ')');





            drawingElement =  movingElement = selectedElement = null;

            //deselect ALL
            $scope.setCurrent(null);

            if($scope.command.action == Command.action.ADD) {

                $scope.reset();

                drawingElement = $scope.command.element;
                if(drawingElement.constrainedToType != null) {
                    var elem = $scope.checkForConstraint(startX, startY, drawingElement.constrainedToType);
                    if(elem == null) {

                        notify.logWarning('Invalid point','You have to start element drawing, over an existing layout');
                        return;
                    }
                    console.log(elem);
                    drawingElement.constrainedTo = elem;

                    if(PrerequisiteType.isEquipment(drawingElement) && drawingElement.id == null){
                        drawingElement.equipment = new EEquipment(new Frequency(drawingElement.constrainedTo.riskClass, drawingElement.prerequisiteType),drawingElement.equipmentType);
                    }
                }

                $log.info("setInitialPoint: (" + startX / _canvasElement.width + ','+ startY / _canvasElement.height + ')');

                drawingElement.setInitialPoint(startX / _canvasElement.width, startY / _canvasElement.height);
                drawingElement.setDrawing(true);

                if(!drawingElement.shape.isFixed()) {
                    drawingElement.setWidth(0.01);
                    drawingElement.setHeight(0.01);
                }

                $scope.setCurrent(drawingElement);
                $scope.drawElement(drawingElement, getContext());
            }
            else { // check for selection
                selectedElement = $scope.checkForSelection(startX, startY, $scope.command.type);

                if (selectedElement) {
                    movingElement = selectedElement;
                }
            }
        };

        $scope.onMouseMove = function(event){
            if(drawingElement){
                // get current mouse position
                var currentX = event.offsetX;
                var currentY = event.offsetY;


                if($scope.command.action == Command.action.ADD) {

                    if(checkConstraint(drawingElement, currentX, currentY)) {
                        drawingElement.setEndPoint(currentX / _canvasElement.width, currentY / _canvasElement.height);
                    }
                    //ctx.closePath();
                    $scope.reset();

                    $scope.drawElement(drawingElement, getContext());

                    //ctx.beginPath();


                }
            } else if(movingElement) {

                if(checkConstraint(movingElement, event.offsetX, event.offsetY)) {

                    var offsetX = event.offsetX - prevX;
                    var offsetY = event.offsetY - prevY;

                    movingElement.shape.startX += (offsetX / _canvasElement.width);
                    movingElement.shape.startY += (offsetY / _canvasElement.height);

                }
            }

            $scope.$apply();

            prevX = event.offsetX;
            prevY = event.offsetY;
        };

        $scope.onMouseUp = function(event){
            // stop drawing and save
            if(drawingElement) {
                drawingElement.completeDrawing();
                drawingElement = null;
            } else if (movingElement) {

                movingElement.completeDrawing();
                movingElement = null;
            }
        };


        function checkConstraint(drawingElement, currentX, currentY)
        {
            if (drawingElement.constrainedToType != null && (drawingElement.constrainedTo != null)) {
                var elem = $scope.checkForConstraint(currentX, currentY, drawingElement.constrainedToType);

                if (!elem || elem.id != drawingElement.constrainedTo.id) {
                    return false;
                }
            }


            return true;
        }

        //drawingElement.setWidth((currentX - startX) / canvasElement.width);
        //drawingElement.setHeight((currentY - startY)  / canvasElement.height);


        $scope.getCanvasStyle = function() {

            if($scope.selectedFloor /*&& $scope.selectedFloor.backgroundImageAttachment*/) {

                var attachment = $scope.selectedFloor.backgroundImageAttachment;

                if(attachment){
                    
                    var url = attachment.link ? attachment.link : ( attachment.data ?
                    'data:' + attachment.mimeType + ';base64,' + attachment.data : null);

                } else {

                    var url = null;

                }
                
                return {
                    'background-image':  'url(' + url+ ')',
                    'background-size': 'contain',
                    'background-repeat': 'no-repeat',
                    "width":"100%", //$scope.selectedFloor.width+"px",
                    "height":"100%", //$scope.selectedFloor.height+"px",
                    "border":"solid 2px #aaa"
                }
            }
        };

        $scope.setCanvasElement = function(canvas) {
           if(canvas) {
               _canvasElement = canvas;
               _context = canvas.getContext('2d');


               _canvasElement.style.width = '100%';
               _canvasElement.style.height = '100%';
           }
        };

        function getContext() {
            return _canvasElement.getContext('2d');
        }

        
        $scope.checkForSelection = function(posX, posY, type) {

            $log.info('checkForSelection(' + posX + ','+ posY +',' + type+')');

            if($scope.elements) {
                var elems = $scope.elements.filter(function(elem){
                    return elem.floor.id == $scope.selectedFloor.id && (!type || elem.prerequisiteType.name == type)  &&
                        elem.shape && elem.shape.isAround(posX / _canvasElement.width, posY / _canvasElement.height);
                }).sort(function(a,b){ return a.order < b.order; });
                $log.info("Element selected: %O", elems);
                return $scope.setCurrent(elems[0]);
            }

        };

        $scope.checkForConstraint = function(posX, posY, type) {

            if($scope.elements) {
                var elems = $scope.elements.filter(function(elem){
                    return elem.floor.id == $scope.selectedFloor.id && (!type || elem.prerequisiteType.name == type.name)  &&
                        elem.shape && elem.shape.isAround(posX / _canvasElement.width, posY / _canvasElement.height);
                }).sort(function(a,b){ return a.order < b.order; });

                return elems[0];
            }
        };


        // canvas reset
        $scope.reset = function(){
            if(_canvasElement) {
                _canvasElement.width = _canvasElement.width;
                getContext().clearRect(0, 0, _canvasElement.width, _canvasElement.height);
                drawAllElements();
                drawSelectedElement();
            }
        };


        $scope.setCurrent = function(element) {
            if($scope.selectedElement ) {
                $scope.selectedElement.selected = null;
                $scope.selectedElement = null;
            }

            $scope.elements.forEach(function(item){
                item.selected = null;
            });

            if(element) {
                element.selected = true;
                $scope.selectedElement = element;
            }
            $scope.$apply();
            return element;
        };

        function drawAllElements(elements) {
            
            elements = elements || ($scope.elements || []).filter(function(elem){
                    return $scope.selectedFloor && $scope.selectedFloor.id == elem.floor.id && !elem.drawing &&
                        (!$scope.selectedElement || elem.type != $scope.command.type || $scope.selectedElement.id != elem.id );
                });

            if(elements) {
                elements.sort(function(a,b){return a.order > b.order;}).forEach(function(element) {
                    $scope.drawElement(element, getContext());
                });
            }
        }


        function drawSelectedElement() {
            if ($scope.selectedElement && $scope.selectedElement.selected) {
                $scope.drawElement($scope.selectedElement, getContext());
            }
        }

        $scope.drawElement = function(element, context) {

            if(element) {

                if(element.drawing && element.shape &&
                    element.shape.type == Shape.CIRCLE) { // update radius

                    var sizeX = element.shape.sizeX * _canvasElement.width;
                    var sizeY = element.shape.sizeY * _canvasElement.height;

                    element.shape.radius = (Math.sqrt( sizeX*sizeX + sizeY*sizeY ) / _canvasElement.width);
                }


                if (PrerequisiteType.isLayout(element)) {
                    drawLayout(element, context);
                } else if (PrerequisiteType.isWaterSupply(element)) {
                    drawWaterSupply(element, context);
                } else if (PrerequisiteType.isAirConditioning(element)) {
                    drawAirConditioning(element, context);
                } else if (PrerequisiteType.isCleaning(element)) {
                    drawCleaning(element, context);
                } else if (PrerequisiteType.isWasteDisposal(element)) {
                    drawWasteDisposal(element, context);
                } else if (PrerequisiteType.isEquipment(element)) {
                    drawEquipment(element, context);
                } else if (PrerequisiteType.isPestControl(element)) {
                    drawPestControl(element, context);
                }
            }
        };

        function drawLayout(element, context) {
            if(!element.shape) {
                return;
            }

            if(!element.riskClass) {
                return;
            }
            
            if(element.shape.type == Shape.RECTANGLE) {
                //drawRect(context, element.shape, element.selected);

                var shape = element.shape;

                context.beginPath();
                context.rect(
                    shape.startX * _canvasElement.width,
                    shape.startY * _canvasElement.height,
                    shape.sizeX * _canvasElement.width,
                    shape.sizeY * _canvasElement.height );

                var rgb = UtilsService.hexToRgb(element.riskClass.color);
                var alpha = element.selected ? 0.6 : 0.3;
                var lineWidth = 2;

                if($scope.command.type != PrerequisiteType.LAYOUT){
                    alpha = 0.02;
                    lineWidth = 1;
                }

                context.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b +"," + alpha +")";
                context.fill();

                context.lineWidth = lineWidth;
                context.strokeStyle = element.riskClass.color;
                context.stroke();

                context.closePath();

                if(!element.drawing) {
                    context.beginPath();
                    context.fillStyle = element.selected ? '#fff' : element.riskClass.color;

                    context.font = "1em Arial";
                    context.fillText(
                        element.name.toUpperCase(),
                        (shape.getTopLeftCornerX() * _canvasElement.width) + 6,
                        (shape.getTopLeftCornerY() * _canvasElement.height) + 18);

                    context.closePath();
                }
            }
        }

        function drawWaterSupply(element, context) {
            if(!element.shape) {
                return;
            }
            if(element.shape.type == Shape.CIRCLE_FIX) {

                var shape = element.shape;

                var centerX = shape.startX * _canvasElement.width;
                var centerY = shape.startY * _canvasElement.height;
                var radius = shape.radius * _canvasElement.width;

                context.beginPath();
                context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

                var rgb = UtilsService.hexToRgb(shape.color);
                var alpha = element.selected ? 1 : 0.5;
                context.fillStyle = shape.color; //"rgb(" + rgb.r + "," + rgb.g + "," + rgb.b +"," + alpha +")";
                context.fill();

                context.lineWidth = 2;
                context.strokeStyle = element.selected ? '#f00' : shape.color;
                context.stroke();

                context.closePath();

                if(!element.drawing) {
                    context.beginPath();
                    context.fillStyle = '#fff';
                    context.textAlign="center";
                    context.font = "1.2em Arial";
                    context.fillText(element.name.toUpperCase(),
                        (shape.startX * _canvasElement.width),
                        (shape.startY * _canvasElement.height) + 6);

                    context.closePath();
                }

            }
        }

        function drawAirConditioning(element, context) {
            if (!element.shape) {
                return;
            }
            if (element.shape.type == Shape.RECTANGLE) {
                drawRect(context, element.shape, element.selected);

                if(!element.drawing) {
                    context.beginPath();
                    context.fillStyle = element.selected ? '#fff' : element.shape.color;

                    context.font = "1em Arial";
                    context.fillText(
                        element.name.toUpperCase(),
                        (element.shape.getTopLeftCornerX() * _canvasElement.width) + 6,
                        (element.shape.getTopLeftCornerY() * _canvasElement.height) + 18);

                    context.closePath();
                }


            } else if(element.shape.type == Shape.CIRCLE) {

                drawCircle(context, element.shape.startX, element.shape.startY, element.shape.radius, element.shape.color, element.selected);

                if(element.drawing) {
                    drawLine(context,
                        element.shape.startX, element.shape.startY,
                        element.shape.startX + element.shape.sizeX, element.shape.startY+element.shape.sizeY,
                        element.shape.color);
                } else {
                    context.beginPath();
                    context.fillStyle = element.selected ? '#fff' : element.shape.color;

                    context.textAlign="center";
                    context.font = "1.2em Arial";
                    context.fillText(element.name.toUpperCase(),
                        (element.shape.startX * _canvasElement.width),
                        (element.shape.startY * _canvasElement.height) + 6);
                    context.textAlign="left";
                    context.closePath();
                }
            }
        }

        function drawEquipment(element, context) {

            $log.info("drawEquipment", element);

            if (!element.shape) {
                return;
            }
            if (element.shape.type == Shape.RECTANGLE_FIX) {

                context.beginPath();
                context.rect(
                    element.shape.startX * _canvasElement.width,
                    element.shape.startY * _canvasElement.height,
                    element.shape.sizeX * _canvasElement.width,
                    element.shape.sizeY * _canvasElement.width );

                var color = element.shape.color;

                var rgb = UtilsService.hexToRgb(color);
                var alpha = element.selected ? 0.6 : 0.3;
                var lineWidth = 2;

                context.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b +"," + alpha +")";
                context.fill();

                context.lineWidth = lineWidth;
                context.strokeStyle = color;
                context.stroke();

                if(!element.drawing) {
                    context.beginPath();
                    context.fillStyle = element.selected ? '#fff' : element.shape.color;

                    context.font = "1em Arial";
                    context.fillText(
                        element.name.toUpperCase(),
                        (element.shape.getTopLeftCornerX() * _canvasElement.width) + 6,
                        (element.shape.getTopLeftCornerY() * _canvasElement.height) + 18);

                    context.closePath();
                }


            } else if(element.shape.type == Shape.CIRCLE_FIX) {

                drawCircle(context, element.shape.startX, element.shape.startY, element.shape.radius, element.shape.color, element.selected);

                if(element.drawing) {
                    drawLine(context,
                        element.shape.startX, element.shape.startY,
                        element.shape.startX + element.shape.sizeX, element.shape.startY+element.shape.sizeY,
                        element.shape.color);
                } else {
                    context.beginPath();
                    context.fillStyle = element.selected ? '#fff' : element.shape.color;

                    context.textAlign="center";
                    context.font = "1.2em Arial";
                    context.fillText(element.name.toUpperCase(),
                        (element.shape.startX * _canvasElement.width),
                        (element.shape.startY * _canvasElement.height) + 6);
                    context.textAlign="left";
                    context.closePath();
                }
            }
        }

        function drawCleaning(element, context) {
            if(!element.shape) {
                return;
            }
            if(element.shape.type == Shape.RECTANGLE) {

                var shape = element.shape;
                var constrainedShape = element.constrainedTo ? element.constrainedTo.shape : shape

                var startX = Math.max(shape.getTopLeftCornerX(),constrainedShape.getTopLeftCornerX() );
                var startY = Math.max(shape.getTopLeftCornerY(),constrainedShape.getTopLeftCornerY() );
                var sizeX = Math.min(shape.getBottomRightCornerX(),constrainedShape.getBottomRightCornerX()) - startX;
                var sizeY = Math.min(shape.getBottomRightCornerY(),constrainedShape.getBottomRightCornerY()) - startY;

                context.beginPath();
                context.rect(
                    startX * _canvasElement.width,
                    startY * _canvasElement.height,
                    sizeX * _canvasElement.width,
                    sizeY * _canvasElement.height );

                var color = element.constrainedTo ? element.constrainedTo.riskClass.color :
                    element.shape.color;

                var rgb = UtilsService.hexToRgb(color);
                var alpha = element.selected ? 0.6 : 0.3;
                var lineWidth = 2;

                if($scope.command.type != PrerequisiteType.CLEANING){
                    alpha = 0.02;
                    lineWidth = 1;
                }

                context.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b +"," + alpha +")";
                context.fill();

                context.lineWidth = lineWidth;
                context.strokeStyle = color;
                context.stroke();

                context.closePath();

                if(!element.drawing) {
                    context.beginPath();
                    context.fillStyle = element.selected ? '#fff' : color;

                    context.font = "1em Arial";
                    context.fillText(
                        element.name.toUpperCase(),
                        (startX * _canvasElement.width) + 6,
                        (startY * _canvasElement.height) + 18);

                    context.closePath();
                }
            }
        }

        function drawWasteDisposal(element, context) {

            $log.info("drawWasteDisposal", element);

            if(!element.shape) {
                return;
            }

            var shape = element.shape;
            var color = element.shape.color;

            var startX = shape.startX;
            var startY = shape.startY;
            var sizeX = 0.04;
            var sizeY = 0.04;

            context.beginPath();

            context.rect(
                startX * _canvasElement.width,
                startY * _canvasElement.height,
                sizeX * _canvasElement.width,
                sizeY * _canvasElement.width );

            context.fillStyle = color
            context.fill();

            context.lineWidth = lineWidth;
            context.strokeStyle = element.selected ? '#444': color;
            context.stroke();

            startX += 0.02;
            startY += (0.02 * _canvasElement.width / _canvasElement.height);

            var centerX = shape.startX + shape.sizeX;
            var centerY = shape.startY + shape.sizeY;

            var midX = (startX + centerX) / 2;
            var midY = (startY + centerY)/ 2;

            drawLine(context, startX, startY, midX, startY, element.selected ? '#444': color );
            drawLine(context, midX, startY, midX, centerY, element.selected ? '#444': color );
            drawLine(context, midX, centerY, centerX, centerY, element.selected ? '#444': color );

            context.moveTo(centerX * _canvasElement.width, centerY * _canvasElement.height);

            var radius = 0.0125 * _canvasElement.width;

            context.arc(
                centerX * _canvasElement.width,
                centerY * _canvasElement.height,
                radius, 0, 2 * Math.PI, false);

            var rgb = UtilsService.hexToRgb(color);
            var alpha = element.selected ? 0.6 : 0.3;
            var lineWidth = 2;

            if($scope.command.type != PrerequisiteType.WASTE_DISPOSAL){
                alpha = 0.02;
                lineWidth = 1;
            }

            context.fillStyle =  color;
            context.fill();

            context.lineWidth = lineWidth;
            context.strokeStyle = element.selected ? '#444': color;
            context.stroke();

            if(!element.drawing) {
                context.beginPath();
                context.fillStyle = '#fff';
                context.textAlign="center";
                context.font = "1em Arial";
                context.fillText(
                    element.name.toUpperCase(),
                    (startX * _canvasElement.width),
                    (startY * _canvasElement.height) + 5);

                context.closePath();
            }
        }
        
        function drawPestControl(element, context) {
            if(!element.shape) {
                return;
            }
            if(element.shape.type == Shape.CIRCLE_FIX) {

                var shape = element.shape;

                var centerX = shape.startX * _canvasElement.width;
                var centerY = shape.startY * _canvasElement.height;
                var radius = shape.radius * _canvasElement.width;

                context.beginPath();
                context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

                var rgb = UtilsService.hexToRgb(shape.color);
                var alpha = element.selected ? 1 : 0.5;
                context.fillStyle = shape.color; //"rgb(" + rgb.r + "," + rgb.g + "," + rgb.b +"," + alpha +")";
                context.fill();

                context.lineWidth = 2;
                context.strokeStyle = element.selected ? '#f00' : shape.color;
                context.stroke();

                context.closePath();

                if(!element.drawing) {
                    context.beginPath();
                    context.fillStyle = '#fff';
                    context.textAlign="center";
                    context.font = "1.2em Arial";
                    context.fillText(element.name.toUpperCase(),
                        (shape.startX * _canvasElement.width),
                        (shape.startY * _canvasElement.height) + 6);

                    context.closePath();
                }

            }
        }



        function  drawLine(context, startX, startY, endX, endY, color) {
            context.beginPath();
            context.moveTo(startX * _canvasElement.width, startY * _canvasElement.height);
            context.lineTo(endX * _canvasElement.width, endY * _canvasElement.height);
            context.lineWidth = 3;
            context.strokeStyle = color;
            context.stroke();
            context.closePath();
        }

        function drawRect(context, shape, selected){
            context.beginPath();
            context.rect(
                shape.startX * _canvasElement.width,
                shape.startY * _canvasElement.height,
                shape.sizeX * _canvasElement.width,
                shape.sizeY * _canvasElement.height );

            var rgb = UtilsService.hexToRgb(shape.color);
            var alpha = selected ? 0.5 : 0.1;
            context.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b +"," + alpha +")";
            context.fill();

            context.lineWidth = 2; //selected ? 5 : 2;
            context.strokeStyle = shape.color;
            context.stroke();

            context.closePath();
        }

        function drawCircle(context, cenX, cenY, rad, color, selected){
            var centerX = cenX * _canvasElement.width;
            var centerY = cenY * _canvasElement.height;
            var radius = rad * _canvasElement.width;

            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

            var rgb = UtilsService.hexToRgb(color);
            var alpha = selected ? 0.5 : 0.1;
            context.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b +"," + alpha +")";
            context.fill();

            context.lineWidth = 2;
            context.strokeStyle = color;
            context.stroke();

            context.closePath();
        }



        function onFloorSelected() {

            $log.info("onFloorSelected():", $scope.selectedFloor);

            // clear selection
            if($scope.selectedElement ) {
                $scope.selectedElement.selected = null;
                $scope.selectedElement = null;
            }

            if($scope.selectedFloor && _canvasElement) {

                var ratio = DEFAULT_RATIO;


                /*
                if ($scope.selectedFloor.backgroundImageHeight && $scope.selectedFloor.backgroundImageWidth) {
                    ratio = $scope.selectedFloor.backgroundImageHeight / $scope.selectedFloor.backgroundImageWidth;
                }
                */

                if ($scope.selectedFloor.height && $scope.selectedFloor.width) {
                    ratio = $scope.selectedFloor.height / $scope.selectedFloor.width;
                }

                $timeout(function(){
                    _canvasElement.width = _canvasElement.offsetWidth;
                    _canvasElement.height = ratio * _canvasElement.width;

                    $scope.reset();
                },0);

            }
        }
        
        function init() {

            $scope.$watch('elements', function(elements){

               // $log.info("watch elements:", elements);
                if(elements) {
                    $scope.reset();
                }

            }, true);

            $scope.$watch('selectedElement', function(element){

                //$log.info('watch selectedElement', element);
                if(element && !element.drawing) {
                    //$log.info('watch selectedElement', element);
                    $scope.reset();

                    drawSelectedElement();
                }
            }, true);

            $scope.$watch('selectedFloor', function(floor) {

                if(floor != null) {
                    onFloorSelected();
                }
                return;
/*
                if(floor && _canvasElement) {
                    var ratio = floor.backgroundImageHeight / floor.backgroundImageWidth;

                    _canvasElement.width  = _canvasElement.offsetWidth;
                    _canvasElement.height = ratio * _canvasElement.width;

                    $scope.reset();
                }
                */

            })

            angular.element($window).bind('resize', function(){
                onFloorSelected();
            });

        }

        init();
    });