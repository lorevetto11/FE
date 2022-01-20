angular.module('APP')
    .factory('Shape', function ($log) {

        function Shape(type) {
            
            this.type = type;

            // this.startX = startX;
            // this.startY = startY;
            // this.sizeX = sizeX;
            // this.sizeY = sizeY;
            
            // this.radius = 0;

        }

        var _isInside = function(shape, posX, posY) {
            if(!shape || !posX || !posY) {
                return false;
            }

            function insideX(){
                return (shape.sizeX >= 0 && (posX > shape.startX && (posX < shape.startX + shape.sizeX))) ||
                            (shape.sizeX < 0 && (posX < shape.startX && (posX > shape.startX + shape.sizeX)));
            }

            function insideY(){
                return (shape.sizeY >= 0 && (posY > shape.startY && (posY < shape.startY + shape.sizeY))) ||
                    (shape.sizeY < 0 && (posY < shape.startY && (posY > shape.startY + shape.sizeY)));
            }

            function insideRadius() {
                var distance = Math.sqrt( (posX - shape.startX)*(posX - shape.startX) + (posY - shape.startY)*(posY - shape.startY) );
                return distance <= shape.radius;
            }

            if(shape.type == Shape.RECTANGLE || shape.type == Shape.RECTANGLE_FIX) {
                return insideX() && insideY();
            } else if(shape.type == Shape.CIRCLE || shape.type == Shape.CIRCLE_FIX) {
                return insideRadius()
            }
        };

        Shape.parse = function(obj){

            if (obj != null) {

                var shape =  new Shape();

                shape.id = obj.id;

                shape.type = obj.type;
                shape.startX = obj.startX;
                shape.startY = obj.startY;
                shape.sizeX = obj.sizeX;
                shape.sizeY = obj.sizeY;
                shape.radius = obj.radius;
                shape.order = obj.order;
                shape.color = obj.color;

                shape.deleted = obj.deleted;
                return shape;

            } else {

                return angular.extend(new Shape(), obj);

            }

        };

        Shape.prototype = {
            isAround: function (posX, posY) {
                return _isInside(this, posX, posY);
            },
            isFixed: function () {
                return (this.type && (this.type.indexOf(Shape.RECTANGLE_FIX) != -1 || this.type.indexOf(Shape.CIRCLE_FIX) != -1));
            },
            getTopLeftCornerX: function () {
                return this.sizeX >= 0 ? this.startX : this.startX + this.sizeX;
            },
            getTopLeftCornerY: function () {
                return this.sizeY >= 0 ? this.startY : this.startY + this.sizeY;
            },

            getBottomRightCornerX: function () {
                return this.sizeX >= 0 ? this.startX+this.sizeX : this.startX;
            },
            getBottomRightCornerY: function () {
                return this.sizeY >= 0 ? this.startY + this.sizeY : this.startY;
            }

        };

        Shape.RECTANGLE = '1';
        Shape.CIRCLE = '2';
        Shape.RECTANGLE_FIX = '3';
        Shape.CIRCLE_FIX = '4';

        return Shape;

    });