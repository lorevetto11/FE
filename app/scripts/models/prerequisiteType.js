angular.module('APP')
    .factory('PrerequisiteType', function (ResourceService) {

        function PrerequisiteType(id, name) {
            id ? this.id = id : null;
            name ? this.name = name : null;
        }

        PrerequisiteType.parse = function (obj) {

            if (obj != null) {

                var prerequisiteType = new PrerequisiteType();

                prerequisiteType.id = obj.id;

                prerequisiteType.name = obj.name;
                prerequisiteType.description = obj.description;

                prerequisiteType.deleted = obj.deleted;

                return prerequisiteType;

            } else {

                return null;

            }

        };

        PrerequisiteType.isLayout = function(element) {
            return element && element.prerequisiteType.name == "Layout";
        };

        PrerequisiteType.isWaterSupply = function(element) {
            return element && element.prerequisiteType.name == "WaterSupply";
        };

        PrerequisiteType.isAirConditioning = function(element) {
            return element && element.prerequisiteType.name == "AirConditioning";
        };

        PrerequisiteType.isCleaning = function(element) {
            return element && element.prerequisiteType.name == "Cleaning";
        };

        PrerequisiteType.isWasteDisposal = function(element) {
            return element && element.prerequisiteType.name == "WasteDisposal";
        };

        PrerequisiteType.isEquipment = function(element) {
            return element && element.prerequisiteType.name == "Equipment";
        };

        PrerequisiteType.isPestControl = function(element) {
            return element && element.prerequisiteType.name == "PestControl";
        };

        PrerequisiteType.isCCP = function(element) {
            return element && element.prerequisiteType.name == "Danger";
        };

        PrerequisiteType.prototype = {
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

        PrerequisiteType.LAYOUT = 'Layout';
        PrerequisiteType.FLOW = 'Flow';
        PrerequisiteType.WATER_SUPPLY = 'WaterSupply';
        PrerequisiteType.AIR_CONDITIONING = 'AirConditioning';
        PrerequisiteType.ENERGY_SUPPLY = 'EnergySupply';
        PrerequisiteType.WASTE_DISPOSAL = 'WasteDisposal';
        PrerequisiteType.CLEANING = 'Cleaning';
        PrerequisiteType.EQUIPMENT = 'Equipment';
        PrerequisiteType.PEST_CONTROL = 'PestControl';
        PrerequisiteType.STAFF_HYGIENE = 'StaffHygiene';
        PrerequisiteType.PACKAGING_MATERIAL = 'PackagingMaterial';
        PrerequisiteType.SUPPLIER = 'Supplier';
        PrerequisiteType.DANGER = 'Danger';
        PrerequisiteType.ANY = 'Any\u0020prerequisite\u0020type';
        PrerequisiteType.CCP = 'CCP';
        PrerequisiteType.OPRP = 'OPRP';

        PrerequisiteType.TYPES = [
            PrerequisiteType.LAYOUT ,
            PrerequisiteType.FLOW,
            PrerequisiteType.WATER_SUPPLY,
            PrerequisiteType.AIR_CONDITIONING,
            PrerequisiteType.ENERGY_SUPPLY,
            PrerequisiteType.WASTE_DISPOSAL,
            PrerequisiteType.CLEANING,
            PrerequisiteType.EQUIPMENT,
            PrerequisiteType.PEST_CONTROL,
            PrerequisiteType.STAFF_HYGIENE,
            PrerequisiteType.PACKAGING_MATERIAL,
            PrerequisiteType.SUPPLIER,
            PrerequisiteType.DANGER,
            PrerequisiteType.ANY,
            PrerequisiteType.CCP,
            PrerequisiteType.OPRP
        ];

        return PrerequisiteType;

    });