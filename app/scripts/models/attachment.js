angular.module('APP')
    .factory('Attachment', function (Context) {

        function Attachment(id) {
            this.id = id;
        }

        Attachment.parse = function(obj){

            if (obj != null) {

                var attachment = new Attachment();

                attachment.id = obj.id;

                attachment.context = Context.parse(obj.context);

                attachment.filename = obj.filename;
                attachment.description = obj.description;
                attachment.mimeType = obj.mimeType;
                attachment.data = obj.data;
                attachment.type = obj.type;
                attachment.fileSize = obj.fileSize;

                attachment.deleted = obj.deleted;

                return attachment;

            } else {

                return null;

            }

        };
        
        return Attachment;
    });