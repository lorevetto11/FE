angular.module('APP')
    .factory('Supplier', function ($translate, Organization, Context, ResourceService) {

        function Supplier(obj) {

            if(obj){

                obj.organization ? this.organization = new Organization(obj.organization) : null;
                obj.context ? this.context = new Context(obj.context) : null;

            } else {

                this.organization = null;
                this.context = null;

            }
            
            var selectedOrganization = ResourceService.getSelectedOrganization();
            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;

            this.name = this.name = $translate.instant("new.supplier");
            this.description = null;
            this.vatNumber = null;
            this.address = null;
            this.phone = null;
            this.email = null;
            this.contact = null;

        }
    
        Supplier.parse = function(obj){

            if (obj != null) {

                var supplier = new Supplier(obj);

                supplier.id = obj.id;

                supplier.organization = Organization.parse(obj.organization);
                supplier.context = Context.parse(obj.context);

                supplier.name = obj.name;
                supplier.description = obj.description;
                supplier.vatNumber = obj.vatNumber;
                supplier.address = obj.address;
                supplier.phone = obj.phone;
                supplier.email = obj.email;
                supplier.contact = obj.contact;

                return supplier;

            } else {

                return null;

            }

        };

        return Supplier;

    });