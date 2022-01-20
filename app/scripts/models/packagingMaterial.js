angular.module('APP')
    .factory('PackagingMaterial', function ($translate, Organization, Supplier, PrerequisiteType, MaterialCategory, Context, ResourceService) {

        PackagingMaterial.TYPES = {
            PACKAGING: "PACKAGING",
            FOOD: "FOOD",
            CLEANING: "CLEANING",
            EQUIPMENT: "EQUIPMENT"
        };

        function PackagingMaterial(obj) {

            if(obj){

                obj.supplier ? this.supplier = new Supplier(obj.supplier) : null;
                obj.prerequisiteType ? this.prerequisiteType = new PrerequisiteType(obj.prerequisiteType) : null;
                obj.materialCategory ? this.materialCategory = new MaterialCategory(obj.materialCategory) : null;
                obj.context ? this.context = new Context(obj.context) : null;

            } else {

                this.supplier = null;
                this.prerequisiteType = new PrerequisiteType(12, "PackagingMaterial");
                this.materialCategory = null;
                this.context = null;

            }

            var selectedOrganization = ResourceService.getSelectedOrganization();
            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;

            this.name = this.name = $translate.instant("new.material");
            this.description = null;
            this.type = null;

        }
    
        PackagingMaterial.parse = function(obj){

            if (obj != null) {

                var packagingMaterial = new PackagingMaterial(obj);

                packagingMaterial.id = obj.id;

                packagingMaterial.organization = Organization.parse(obj.organization);
                packagingMaterial.supplier = Supplier.parse(obj.supplier);
                packagingMaterial.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);
                packagingMaterial.materialCategory = MaterialCategory.parse(obj.materialCategory);
                packagingMaterial.context = Context.parse(obj.context);

                packagingMaterial.name = obj.name;
                packagingMaterial.description = obj.description;
                packagingMaterial.type = obj.type;

                return packagingMaterial;

            } else {

                return null;

            }

        };

        return PackagingMaterial;

    });