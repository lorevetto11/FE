angular.module('APP')
    .controller('PlanCtrl', function ($rootScope, $scope, $log, $translate, $state, $uibModal, $timeout, $window,
                                      Floor, amMoment, notify, APIService, ResourceService, UtilsService, ENV) {

        $scope.floors = null;
        $scope.selectedFloor = null;
        $scope.itemsLoading = null;

        $scope.selectedElement = null;


        $scope.selectFloor = function (floor) {

            if (floor) {

                $scope.selectedFloor = floor;
                ResourceService.setSelectedFloor(floor);

            }

        };

        $scope.addFloor = function () {

            // TODO: show modal for floor data entering

            var floor = {
                id: $scope.floors.length,
                name: 'new floor',
                backgroundImage: {
                    uri: '',
                    width: 975,
                    height: 537
                }
            };

            $scope.floors.push(floor);
            $scope.selectFloor(floor);
        };

        function init() {

            $scope.floors = null;
            $scope.itemsLoading = true;
            $scope.selectFloor(null);

            APIService.getFloorsByOrganizationId(ResourceService.getSelectedOrganization().id).then(
                function (data) {

                    // var attachmentIds = items.filter(function(a){
                    //     return a.backgroundImageAttachmentId != null;
                    // }).map(function (a) {
                    //     return a.backgroundImageAttachmentId;
                    // });
                    //
                    // APIService.recursiveCall(attachmentIds, APIService.findAttachmentById).then(
                    //     function success(data){
                    //
                    //         $log.info("recursiveCall: ", data);
                    //
                    //         items.forEach(function(item){
                    //             item.backgroundImageAttachment = data.find(function(a){
                    //                 $log.info(a.id + ':', item.backgroundImageAttachmentId);
                    //                 return a.id === item.backgroundImageAttachmentId;
                    //             })
                    //         });

                    $scope.floors = data;
                    $log.info("Floors: %O", $scope.floors);

                    if ($scope.floors.length > 0) {
                        $scope.selectFloor($scope.floors.reduce(function(a, b) {
                            return a.order <= b.order ? a : b;
                        }, 0));
                    }

                    var contextIds = $scope.floors.map(function (i) {
                        return i.context.id
                    });

                    APIService.recursiveCall(angular.copy(contextIds), APIService.getAttachmentsByContextId).then(
                        function success(data) {

                            $scope.floors.forEach(function (floor) {

                                floor.backgroundImageAttachment = data.find(function (a) {

                                    return a.context.id === floor.context.id;

                                })

                            });

                            $scope.itemsLoading = null;

                        });
                    //     }
                    // );
                }
            );


            // return;


            // var obj = {
            //     id: 5,
            //     name: 'primo piano'
            // };
            //
            // $log.info('OBJ:', obj);
            // $log.info(Floor.parse(obj));
            //
            // $scope.floors = [{
            //     id : 0,
            //     name: '1st floor',
            //     backgroundImage : {
            //         uri :  ENV.hostEndpoint + 'images/floors/first_floor.jpg',
            //         width: 1305,
            //         height: 889
            //     }
            // },
            // {
            //     id : 1,
            //     name: '2nd floor',
            //     backgroundImage : {
            //         uri : ENV.hostEndpoint + 'images/floors/second_floor.jpg',
            //         width: 1459,
            //         height: 879
            //     }
            // },
            // {
            //     id : 3,
            //     name: '3rd floor',
            //     backgroundImage : {
            //         uri : ENV.hostEndpoint + 'images/floors/third_floor.jpg',
            //         width: 1513,
            //         height: 563
            //     }
            // },
            // {
            //     id : 4,
            //     name: '4th floor',
            //     backgroundImage : {
            //         uri : ENV.hostEndpoint + 'images/floors/fourth_floor.jpg',
            //         width: 1693,
            //         height: 805
            //     }
            // }];


        }

        init();
    });