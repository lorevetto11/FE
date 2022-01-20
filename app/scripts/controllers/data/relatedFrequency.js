'use strict';

angular.module('APP')
    .controller('RelatedFrequencyCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $document, $window,
                                                  currentUser, currentOrganization, PrerequisiteType, Frequency, RelatedFrequency, RiskClass, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

        $scope.prerequisiteTypes = null;
        $scope.riskClass = null;
        $scope.frequencies = null;
        $scope.relatedFrequencies = null;
        $scope.itemsLoading = null;

        $scope.selectedItem = null;

        $scope.frequencyPeriods = Frequency.PERIOD;

        $scope.edit = function (item) {

            $scope.selectedItem = angular.copy(item);

        };

        $scope.cancel = function () {

            $scope.selectedItem = null

        };

        $scope.save = function (relatedFrequency) {

            var createFrequencies = [];
            var updateFrequencies = [];

            var originalRelatedFrequency = $scope.relatedFrequencies.find(function (related) {

                return related.prerequisiteType.name == relatedFrequency.prerequisiteType.name;

            });

            relatedFrequency.frequencies.forEach(function (frequency) {

                if (frequency.id == null && (frequency.asNeeded || frequency.justOnce || frequency.value)) {

                    $log.info("Creating Frequency: %O", frequency);
                    createFrequencies.push(frequency);

                } else if (frequency.id != null) {

                    var originalFrequency = originalRelatedFrequency.frequencies.find(function (freq) {

                        return freq.id == frequency.id;

                    });

                    if (originalFrequency.justOnce != frequency.justOnce || originalFrequency.asNeeded != frequency.asNeeded || originalFrequency.value != frequency.value) {

                        $log.info("Updating Frequency: %O", frequency);
                        updateFrequencies.push(frequency);

                    }

                }

            });

                APIService.recursiveCall(createFrequencies, APIService.createFrequency).then(
                    function success() {

                        APIService.recursiveCall(updateFrequencies, APIService.updateFrequency).then(
                            function success() {

                                init();
                                notify.logSuccess('Success', 'Default frequencies successfully updated');

                            },
                            savingError
                        );

                    },
                    savingError
                );





        };

        $scope.somethingChanged = function (relatedFrequency) {

            var originalRelatedFrequency = $scope.relatedFrequencies.find(function (related) {
                return relatedFrequency.prerequisiteType.name == related.prerequisiteType.name;
            });

            var difference = false;
            originalRelatedFrequency.frequencies.forEach(function (frequency, index) {

                if ((frequency.justOnce != relatedFrequency.frequencies[index].justOnce) ||
                    (frequency.asNeeded != relatedFrequency.frequencies[index].asNeeded) ||
                    (frequency.value != relatedFrequency.frequencies[index].value)) {

                    difference = true;

                }

            });

            return difference;

        };

        $scope.isRequired = function (frequency) {

          return (frequency.id != null && (!frequency.asNeeded && !frequency.justOnce && !frequency.value));

        };


        function savingError() {
            $scope.loader = false;
            $scope.errorMessage = "Saving data error!";
        }

        // function getDefaultData(type) {
        //
        //     var relatedFrequency = new RelatedFrequency(type);
        //
        //     $scope.riskClass.forEach(function (risk) {
        //
        //         relatedFrequency.frequencies.push({
        //
        //             riskClass: risk.name,
        //             frequency: new Frequency()
        //
        //         });
        //
        //     });
        //
        //     return relatedFrequency;
        //
        // }

        function init() {

            $scope.itemsLoading = true;

            APIService.getPrerequisiteTypes().then(
                function success(data) {

                    $scope.prerequisiteTypes = data;
                    $log.info("Prerequisite Types: %O", data);

                    APIService.getRiskClassesByOrganizationId(ResourceService.getSelectedOrganization().id).then(
                        function success(data) {

                            $scope.riskClass = data;
                            $log.info("Risk Classes: %O", data);


                            APIService.getFrequenciesByOrganizationId(ResourceService.getSelectedOrganization().id).then(
                                function success(data) {

                                    $scope.frequencies = data;
                                    $log.info("Frequencies: %O", data);

                                    var relatedFrequencies = [];

                                    // For each prerequisiteType create a relatedFrequency
                                    $scope.prerequisiteTypes.forEach(function (prerequisiteType) {

                                        var newRelatedFrequency = new RelatedFrequency(prerequisiteType); // Creo una relatedFrequency di default
                                        relatedFrequencies.push(newRelatedFrequency); // La inserisco nell'array di relatedFrequencies

                                        // For each riskClass create a frequency
                                        $scope.riskClass.forEach(function (riskClass) {

                                            var newFrequency = new Frequency(riskClass, prerequisiteType); // Creo una frequency di default

                                            var relatedFrequencyIndex = relatedFrequencies.indexOf(newRelatedFrequency);
                                            relatedFrequencies[relatedFrequencyIndex].frequencies.push(newFrequency); // Inserisco la nuova frequency nell'array frequencies della relatedFrequency

                                            var frequency = data.find(function (frequency) {    // Trovo la frequency, nei dati risultanti l'xhr request, che ha lo stesso prerequisiteType e
                                                // la stessa riskClass sulla quale stiamo lavorando in questo momento

                                                return frequency.prerequisiteType.id == prerequisiteType.id && frequency.riskClass.id == riskClass.id;

                                            });

                                            if (frequency != null) { // Se c'è, sovrascrivo la frequency di default impostata precedentemente

                                                var frequencyIndex = relatedFrequencies[relatedFrequencyIndex].frequencies.indexOf(newFrequency);
                                                relatedFrequencies[relatedFrequencyIndex].frequencies[frequencyIndex] = frequency;

                                            }

                                        });

                                    });

                                    $scope.relatedFrequencies = relatedFrequencies;
                                    $log.info("Related Frequencies: %O", $scope.relatedFrequencies);

                                    $scope.itemsLoading = null;

                                }
                            );

                        }
                    );

                }
            );

        }

        init();
    })
;
