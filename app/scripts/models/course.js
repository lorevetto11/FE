angular.module('APP')
    .factory('Course', function ($translate, Context, Organization, Frequency, ResourceService) {
        
            function Course() {
    
                var selectedOrganization = ResourceService.getSelectedOrganization();
                this.organization = Organization.parse(selectedOrganization);

                this.name = $translate.instant("new.course");
                this.description = null;
                this.trainer = null;

            }

            Course.parse = function (obj) {

                if (obj != null) {

                    var course = new Course();

                    course.id = obj.id;

                    course.organization = Organization.parse(obj.organization);
                    course.context = Context.parse(obj.context);

                    course.name = obj.name;
                    course.description = obj.description;
                    course.trainer = obj.trainer;

                    course.deleted = obj.deleted;

                    if (obj.frequency) {
                        course.frequency = Frequency.parse(obj.frequency);
                    }

                    return course;

                } else {

                    return null;

                }

            };

            // Course.parse = function (obj) {
            //
            //     if (obj != null) {
            //         var course = new Course();
            //
            //
            //         course.id = obj.id;
            //         course.title = obj.title;
            //         course.description = obj.description;
            //         course.trainer = obj.trainer;
            //
            //         if (obj.frequency) {
            //             course.frequency = Frequency.parse(obj.frequency);
            //         }
            //
            //         return course;
            //
            //     } else {
            //
            //         return null;
            //
            //     }
            //
            // };

            return Course;

        }
    );