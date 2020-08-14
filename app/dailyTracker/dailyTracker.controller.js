(function () {
    'use strict';
    Number.prototype.padZero = function (size) {
        var s = String(this);
        while (s.length < (size || 2)) { s = "0" + s; }
        return s;
    }
    angular
        .module('app')
        .controller('DailyTracker.MyDailyTrackerController', MyDailyTrackerController)
        .controller('DailyTracker.DailyTrackerFormModel', DailyTrackerFormModel)
        .controller('DailyTracker.DailyReport', DailyReport)

    function MyDailyTrackerController(UserService, DailyTrackerService, _, $uibModal, $filter, $state) {
        var vm = this;
        var nowDate = new Date();
        vm.trackerDate = new Date();
        vm.trackerSlotTime = 10;
        vm.trackerTimes = [];
        vm.myTasks = [];
        vm.dailyTaskCategories = [];

        function generateTrackerTimes() {
            var navTime = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 10, 0, 0, 0);
            var cnt = 0;
            while (cnt++ < 40) {
                var trackerTime = {
                    time: navTime,
                    label: navTime.getHours().padZero(2) + ":" + navTime.getMinutes().padZero(2),
                    tasks: []
                }
                navTime.setTime(navTime.getTime() + (vm.trackerSlotTime * 60000));
                trackerTime.label += " - " + navTime.getHours().padZero(2) + ":" + navTime.getMinutes().padZero(2);
                vm.trackerTimes.push(angular.copy(trackerTime));

            }
        }

        function getDailyTaskCategories() {
            DailyTrackerService.getDailyTaskCategories().then(function (response) {
                vm.dailyTaskCategories = response.dailyTaskCategories;
            }, function (error) {
                console.log(error);
            });
        };

        function getUserDailyTrackerTasks() {
            DailyTrackerService.getUserDailyTrackerTasks().then(function (response) {
                console.log(response);
                vm.inventories = response.inventories;
                _.each(vm.inventories, function (dailyTrackerObj) {
                    if (dailyTrackerObj.assignedUser && dailyTrackerObj.assignedUser.name) {
                        dailyTrackerObj.userName = dailyTrackerObj.assignedUser.name;
                    }
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.viewDailyTrackerForm = function (dailyTrackerObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'dailyTracker/dailyTrackerForm.html',
                controller: 'DailyTracker.DailyTrackerFormModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    trackerDate: function () {
                        return vm.trackerDate;
                    },
                    dailyTrackerObj: function () {
                        return dailyTrackerObj;
                    },
                    dailyTaskCategories: function () {
                        return vm.dailyTaskCategories;
                    }
                }
            });

            modalInstance.result.then(function (userObj) {
                getUserDailyTrackerTasks();
            }, function () {
                getUserDailyTrackerTasks();
            });
        }

        vm.stopPropagation = function (e) {
            e.stopPropagation();
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                generateTrackerTimes();
                getDailyTaskCategories();
                getUserDailyTrackerTasks();
            });
        }
        initController();
    };

    function DailyTrackerFormModel(DailyTrackerService, dailyTrackerObj, dailyTaskCategories, trackerDate, $uibModalInstance, $filter, noty) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.dailyTrackerObj = dailyTrackerObj;
        vm.dailyTaskCategories = dailyTaskCategories;
        vm.trackerDate = trackerDate;
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        vm.saveDailyTracker = function (dailyTrackerForm) {
            if (dailyTrackerForm.$valid) {
                var trackerData = {
                    taskCategoryId: vm.dailyTrackerObj.taskCategory._id,
                    taskShortName: vm.dailyTrackerObj.taskCategory.taskCategoryShortName,
                    trackerDate: $filter('date')(vm.trackerDate, "yyyy-MM-dd")
                };
                trackerData.taskStartTime = $filter('date')(vm.trackerDate, "yyyy-MM-dd") + " " + vm.dailyTrackerObj.taskStartTime.getHours().padZero(2) + ":" + vm.dailyTrackerObj.taskStartTime.getMinutes().padZero(2) + ":00";
                trackerData.taskEndTime = $filter('date')(vm.trackerDate, "yyyy-MM-dd") + " " + vm.dailyTrackerObj.taskEndTime.getHours().padZero(2) + ":" + vm.dailyTrackerObj.taskEndTime.getMinutes().padZero(2) + ":00";
                if (vm.dailyTrackerObj._id) {
                    DailyTrackerService.updateDailyTrackerTask(vm.dailyTrackerObj._id, trackerData).then(function (response) {
                        noty.showSuccess("Daily Task has been updated successfully!");
                        $uibModalInstance.close();
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    DailyTrackerService.addDailyTrackerTask(trackerData).then(function (response) {
                        noty.showSuccess("Dily Task has been added successfully!");
                        $uibModalInstance.close();
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }
            } else {
                vm.alerts.push({ msg: "Please enter valid data", type: 'danger' });
            }
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }
        vm.closeDailyTracker = function () {
            $uibModalInstance.close();
        }

        function initController() {

        };
        initController();
    };

    function DailyReport($uibModalInstance, dailyTrackerObj, noty) {
        var vm = this;
        vm.dailyTrackerObj = dailyTrackerObj;

        vm.closeHistory = function () {
            $uibModalInstance.close();
        }

        function initController() {

        };
        initController();
    };

})();
