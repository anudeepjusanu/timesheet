
(function () {
    'use strict';

    angular
        .module('app')
        .controller('DailyTask.DailyTaskCategoriesController', DailyTaskCategoriesController)
        .controller('DailyTask.DailyTaskCategoryModel', DailyTaskCategoryModel);

    function DailyTaskCategoriesController(UserService, DailyTrackerService, $uibModal, FlashService, noty) {
        var vm = this;
        vm.user = {};
        vm.dailyTaskCategories = [];

        function getDailyTaskCategories() {
            DailyTrackerService.getDailyTaskCategories().then(function (data) {
                if (data.dailyTaskCategories) {
                    vm.dailyTaskCategories = data.dailyTaskCategories;
                }
            }, function (errors) {
                console.log(errors);
            });
        }

        vm.viewDailyTaskCategoryModel = function (dailyTaskCategoryObj) {
            var dailyTaskCategory = {};
            if (dailyTaskCategoryObj) {
                dailyTaskCategory = dailyTaskCategoryObj;
                dailyTaskCategory.isNew = false;
            } else {
                dailyTaskCategory.isNew = true;
            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'dailyTracker/dailyTaskCategoryForm.html',
                controller: 'DailyTask.DailyTaskCategoryModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    dailyTaskCategory: function () {
                        return dailyTaskCategory;
                    }
                }
            });

            modalInstance.result.then(function (dailyTaskCategoryObj) {
                //vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
                getDailyTaskCategories();
            }, function () {
                getDailyTaskCategories();
            });
        }

        vm.delDailyTaskCategory = function (dailyTaskCategory) {
            if (confirm("Do you want to delete this Daily Task Category?")) {
                DailyTrackerService.delDailyTaskCategory(dailyTaskCategory).then(function (response) {
                    getDailyTaskCategories();
                });
            }
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getDailyTaskCategories();
        }
    }

    function DailyTaskCategoryModel($uibModalInstance, DailyTrackerService, noty, dailyTaskCategory) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.dailyTaskCategory = dailyTaskCategory;

        vm.saveDailyTaskCategory = function (form) {
            if (form.$valid) {
                console.log(vm.dailyTaskCategory);
                vm.enableSaveBtn = false;
                if (vm.dailyTaskCategory.isNew === true) {
                    DailyTrackerService.addDailyTaskCategory(vm.dailyTaskCategory).then(function (response) {
                        noty.showSuccess("Daily Task Category has been added successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.dailyTaskCategory);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.dailyTaskCategory);
                    });
                } else {
                    DailyTrackerService.updateDailyTaskCategory(vm.dailyTaskCategory).then(function (response) {
                        noty.showSuccess("Daily Task Category has been updated successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.dailyTaskCategory);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.dailyTaskCategory);
                    });
                }
            } else {
                vm.enableSaveBtn = true;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        };

        vm.cancelDailyTaskCategory = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

})();