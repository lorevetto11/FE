angular.module('APP')
    .factory('MaterialCategory', function ($translate) {

        MaterialCategory.TYPES = {
            PACKAGING: "PACKAGING",
            FOOD: "FOOD",
            CLEANING: "CLEANING",
            EQUIPMENT: "EQUIPMENT"
        };

        function MaterialCategory(obj) {

            this.name = this.name = $translate.instant("new.materialCategory");
            this.description = null;
            this.type = null;

        }
    
        MaterialCategory.parse = function(obj){

            if (obj != null) {

                var materialCategory = new MaterialCategory(obj);

                materialCategory.id = obj.id;

                materialCategory.name = obj.name;
                materialCategory.description = obj.description;
                materialCategory.type = obj.type;

                return materialCategory;

            } else {

                return null;

            }

        };

        return MaterialCategory;

    });