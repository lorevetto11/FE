angular.module('APP')
    .factory('Prerequisite', function (Shape) {
        
        function Prerequisite(type) {
            this.name = "new element";
            this.description = null;
            this.type = type;
            this.order = 0;
        }

        Prerequisite.LAYOUT = 'Layout';
        Prerequisite.FLOW = 'Flow';
        Prerequisite.WATER_SUPPLY = 'WaterSupply';
        Prerequisite.AIR_CONDITIONING = 'AirConditioning';
        Prerequisite.ENERGY_SUPPLY = 'EnergySupply';
        Prerequisite.WASTE_DISPOSAL = 'WasteDisposal';
        Prerequisite.CLEANING = 'Cleaning';
        Prerequisite.EQUIPMENT = 'Equipment';
        Prerequisite.PEST_CONTROL = 'PestControl';
        Prerequisite.STAFF_HYGIENE = 'StaffHygiene';
        Prerequisite.PACKAGING_MATERIAL = 'PackagingMaterial';
        Prerequisite.SUPPLIER = 'Supplier';
        Prerequisite.DANGER = 'Danger';

        Prerequisite.isLayout = function(element) {
            return element && element.type == Prerequisite.LAYOUT;
        };

        Prerequisite.isWaterSupply = function(element) {
            return element && element.type == Prerequisite.WATER_SUPPLY;
        };

        Prerequisite.isAirConditioning = function(element) {
            return element && element.type == Prerequisite.AIR_CONDITIONING;
        };

        Prerequisite.isCleaning = function(element) {
            return element && element.type == Prerequisite.CLEANING;
        };

        Prerequisite.isWasteDisposal = function(element) {
            return element && element.type == Prerequisite.WASTE_DISPOSAL;
        };

        Prerequisite.isEquipment = function(element) {
            return element && element.type == Prerequisite.EQUIPMENT;
        };

        Prerequisite.isPestControl = function(element) {
            return element && element.type == Prerequisite.PEST_CONTROL;
        };
        
                
        Prerequisite.isCCP = function(element) {
            return element && element.type == Prerequisite.DANGER;
        };

        Prerequisite.TYPES = [
            Prerequisite.LAYOUT ,
            Prerequisite.FLOW,
            Prerequisite.WATER_SUPPLY,
            Prerequisite.AIR_CONDITIONING,
            Prerequisite.ENERGY_SUPPLY,
            Prerequisite.WASTE_DISPOSAL,
            Prerequisite.CLEANING,
            Prerequisite.EQUIPMENT,
            Prerequisite.PEST_CONTROL,
            Prerequisite.STAFF_HYGIENE,
            Prerequisite.PACKAGING_MATERIAL,
            Prerequisite.SUPPLIER,
            Prerequisite.DANGER
        ];

        Prerequisite.prototype = {
            setInitialPoint: function (x, y) {
                this.shape.startX = x;
                this.shape.startY = y;
            },
            setEndPoint : function(x, y){
                if(!this.shape.isFixed()) {
                    this.shape.sizeX = (x - this.shape.startX);
                    this.shape.sizeY = (y - this.shape.startY);
                }
            },
            setWidth: function (w) {
                this.shape.sizeX = w;
            },
            setHeight: function (h) {
                this.shape.sizeY = h;
            },
            setDrawing: function (drawing) {
                this.drawing = (drawing == true);
            },
            isDrawing: function () {
                return this.drawing;
            },
            completeDrawing: function() {
                this.drawing = false;
                this.shape.startX = Math.round(this.shape.startX * 1000) / 1000 ;
                this.shape.startY = Math.round(this.shape.startY * 1000) / 1000 ;
                this.shape.sizeX = Math.round(this.shape.sizeX * 1000) / 1000 ;
                this.shape.sizeY = Math.round(this.shape.sizeY * 1000) / 1000 ;
            }
        };

        return Prerequisite;

    });