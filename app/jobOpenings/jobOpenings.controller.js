(function () {
    'use strict';

    angular
        .module('app')
        .controller('JobOpenings.ManageJobOpeningsController', ManageJobOpeningsController)
        .controller('JobOpenings.ManageJobOpeningModel', ManageJobOpeningModel)
        .controller('JobOpenings.ReferJobOpeningController', ReferJobOpeningController)
        .filter('MyReceiptsSearch', function ($filter) {
            return function (input, searchObj) {
                var output = input;
                if (searchObj.category && searchObj.category.length > 0 && searchObj.category != "") {
                    output = $filter('filter')(output, function (item) {
                        return (item.receiptCategory == searchObj.category);
                    });
                }
                return output;
            }
        });
    function ManageJobOpeningsController(UserService, JobOpeningService, $uibModal, FlashService, noty) {
        var vm = this;
        vm.user = {};
        vm.jobOpenings = [];

        function getManageJobOpenings() {
            JobOpeningService.getAllJobOpenings().then(function (data) {
                if (data.jobOpenings) {
                    vm.jobOpenings = data.jobOpenings;
                }
            }, function (errors) {
                console.log(errors);
            });
        }

        vm.viewManageJobOpeningModel = function (jobOpeningObj) {
            var jobOpening = {};
            if (jobOpeningObj) {
                jobOpening = jobOpeningObj;
                jobOpening.isNew = false;
            } else {
                jobOpening.isNew = true;
            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'jobOpenings/manageJobOpeningForm.html',
                controller: 'JobOpenings.ManageJobOpeningModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    jobOpening: function () {
                        return jobOpening;
                    }
                }
            });

            modalInstance.result.then(function (JobOpeningObj) {
                //vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
                getManageJobOpenings();
            }, function () {
                getManageJobOpenings();
            });
        }

        vm.delManageJobOpening = function (JobOpening) {
            if (confirm("Do you want to delete this Job Opening?")) {
                JobOpeningService.delJobOpening(JobOpening).then(function (response) {
                    getManageJobOpenings();
                });
            }
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getManageJobOpenings();
        }
    }

    function ManageJobOpeningModel($uibModalInstance, JobOpeningService, noty, jobOpening) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.jobOpening = jobOpening;

        vm.saveManageJobOpening = function (form) {
            if (form.$valid) {
                vm.enableSaveBtn = false;
                if (vm.jobOpening.isNew === true) {
                    JobOpeningService.addJobOpening(vm.jobOpening).then(function (response) {
                        noty.showSuccess("Job Opening has been added successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.jobOpening);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.jobOpening);
                    });
                } else {
                    JobOpeningService.updateJobOpening(vm.jobOpening).then(function (response) {
                        noty.showSuccess("Job Opening has been updated successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.jobOpening);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.jobOpening);
                    });
                }
            } else {
                vm.enableSaveBtn = true;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        };

        vm.cancelManageJobOpening = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    function ReferJobOpeningController(JobOpeningService, $stateParams, noty) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.jobOpening = {};
        vm.refrerJobOpening = {};

        vm.addReferJobOpening = function (form) {
            if (form.$valid) {
                vm.enableSaveBtn = false;
                JobOpeningService.addJobOpening(vm.jobOpening).then(function (response) {
                    noty.showSuccess("Job Opening has been added successfully!");
                    vm.enableSaveBtn = true;
                    $uibModalInstance.close(vm.jobOpening);
                }, function (error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                    vm.enableSaveBtn = true;
                    $uibModalInstance.close(vm.jobOpening);
                });
            } else {
                vm.enableSaveBtn = true;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        };

        function getJobOpening(jobOpeningId) {
            JobOpeningService.getJobOpening(jobOpeningId).then(function (data) {
                console.log(data);
                if (data.jobOpening) {
                    vm.jobOpening = data.jobOpening;
                    vm.refrerJobOpening.subject = "Refer " + vm.jobOpening.jobTitle;
                }
            }, function (errors) {
                console.log(errors);
            });
        }

        function init() {
            if ($stateParams.jobOpeningId) {
                getJobOpening($stateParams.jobOpeningId);
            }
        }
        init();
    };

})();
