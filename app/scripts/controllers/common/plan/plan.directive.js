angular.module('APP')

    .directive('plan', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                items : "=",
                command : "=",
                onSave : "&",
                onDelete : "&"
            },
            controller: 'PlanCtrl',
            templateUrl: 'views/common/plan/plan.tmpl.html'
        };
    })

    .directive('elementDetail', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                elements : "=",
                element : "=",
                onSave : "&",
                onDelete : "&"
            },
            controller: 'ElementDetailCtrl',
            templateUrl: 'views/common/plan/detail.tmpl.html'
        };
    })

    .directive('floorCanvas', function ($log, Command, Layout) {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                elements : "=",
                selectedElement: "=",
                command : "=",
                selectedFloor : "="
            },
            controller: 'CanvasCtrl',
            templateUrl: 'views/common/plan/canvas/canvas.tmpl.html',
            link: function(scope, element){
                
                var canvasElement = element.children()[0];

                scope.setCanvasElement(canvasElement);

                canvasElement.style.width ='100%';
                canvasElement.style.height='100%';
                
                element.bind('mousedown', scope.onMouseDown);
                element.bind('mousemove', scope.onMouseMove);
                element.bind('mouseup', scope.onMouseUp);

                /*
                element.bind('mousedown___', function(event){

                    startX = event.offsetX;
                    startY = event.offsetY;

                    prevX = event.offsetX;
                    prevY = event.offsetY;

                    drawingElement =  movingElement = selectedElement = null;

                    if(scope.command.action == Command.action.ADD) {

                        scope.reset();

                        // begins new line
                        ctx.beginPath();
                        drawingElement = scope.command.element;
                        drawingElement.setInitialPoint(startX / canvasElement.width, startY / canvasElement.height);
                        drawingElement.setDrawing(true);

                        drawingElement.setWidth(0.01);
                        drawingElement.setHeight(0.01);
                        scope.setCurrent(drawingElement);
                        scope.drawElement(drawingElement, ctx);


                    }
                    else { // check for selection
                        selectedElement = scope.checkForSelection(startX, startY, scope.command.type);

                        if (selectedElement) {
                            movingElement = selectedElement;
                        }
                    }
                });



                element.bind('mousemove__', function(event){
                    if(drawingElement){
                        // get current mouse position
                        currentX = event.offsetX;
                        currentY = event.offsetY;


                        if(scope.command.action == Command.action.ADD) {

                            //drawingElement.setWidth((currentX - startX) / canvasElement.width);
                            //drawingElement.setHeight((currentY - startY)  / canvasElement.height);

                            drawingElement.setEndPoint(currentX / canvasElement.width, currentY  / canvasElement.height);

                            ctx.closePath();
                            scope.reset();

                            scope.drawElement(drawingElement, ctx);

                            ctx.beginPath();


                        }
                    } else if(movingElement) {

                        offsetX = event.offsetX;// - prevX;
                        offsetY = event.offsetY;// - prevY;

                        movingElement.shape.startX += (offsetX / canvasElement.width);
                        movingElement.shape.startY += (offsetY / canvasElement.height);

                        //scope.setCurrent(movingElement);
                    }

                    scope.$apply();

                    prevX = event.offsetX;
                    prevY = event.offsetY;
                });

                element.bind('mouseup___', function(event){

                    ctx.closePath();

                    // stop drawing and save
                    if(drawingElement) {
                        drawingElement.completeDrawing();
                        drawingElement = null;
                    } else if (movingElement) {

                        $log.info(movingElement);


                        movingElement.completeDrawing();
                        movingElement = null;
                    }
                });
                */

            }
        };
    })
;


