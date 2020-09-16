(function () {
    'use strict';

    angular
        .module('app')
        .controller('JobOpenings.ManageJobOpeningsController', ManageJobOpeningsController)
        .controller('JobOpenings.ManageJobOpeningModel', ManageJobOpeningModel)
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
    function ManageJobOpeningsController(UserService, DailyTrackerService, $uibModal, FlashService, noty) {
        var vm = this;
        vm.user = {};
        vm.jobOpenings = [];

        function getManageJobOpenings() {
            DailyTrackerService.getManageJobOpenings().then(function (data) {
                if (data.jobOpenings) {
                    vm.jobOpenings = data.jobOpenings;
                }
            }, function (errors) {
                console.log(errors);
            });
        }

        vm.viewManageJobOpeningModel = function (JobOpeningObj) {
            var JobOpening = {};
            if (JobOpeningObj) {
                JobOpening = JobOpeningObj;
                JobOpening.isNew = false;
            } else {
                JobOpening.isNew = true;
            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'jobOpenings/jobOpeningForm.html',
                controller: 'JobOpenings.ManageJobOpeningModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    JobOpening: function () {
                        return JobOpening;
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
                DailyTrackerService.delManageJobOpening(JobOpening).then(function (response) {
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

    function ManageJobOpeningModel($uibModalInstance, DailyTrackerService, noty, JobOpening) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.JobOpening = JobOpening;

        vm.saveManageJobOpening = function (form) {
            if (form.$valid) {
                console.log(vm.JobOpening);
                vm.enableSaveBtn = false;
                if (vm.JobOpening.isNew === true) {
                    DailyTrackerService.addManageJobOpening(vm.JobOpening).then(function (response) {
                        noty.showSuccess("Job Opening has been added successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.JobOpening);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.JobOpening);
                    });
                } else {
                    DailyTrackerService.updateManageJobOpening(vm.JobOpening).then(function (response) {
                        noty.showSuccess("Job Opening has been updated successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.JobOpening);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.JobOpening);
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

})();
