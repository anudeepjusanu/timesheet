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
        vm.trackerIntervel = 30;
        vm.trackerIntervelOpts = [10, 30, 60];
        vm.dayShiftOptions = [
            { label: "24H", startHour: 0, startMinute: 0, endHour: 23, endMinute: 59 },
            { label: "06:00AM to 02:00PM", startHour: 6, startMinute: 0, endHour: 13, endMinute: 59 },
            { label: "09:00AM to 06:00PM", startHour: 9, startMinute: 0, endHour: 17, endMinute: 59 },
            { label: "02:00PM to 11:00PM", startHour: 14, startMinute: 0, endHour: 22, endMinute: 59 }
        ];
        vm.dayShift = vm.dayShiftOptions[2];
        vm.trackerTimes = [];
        vm.dailyTrackerTasks = [];
        vm.dailyTaskCategories = [];
        vm.trackerDateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        function generateTrackerTimes() {
            vm.trackerTimes = [];
            var navTime = new Date(vm.trackerDate.getFullYear(), vm.trackerDate.getMonth(), vm.trackerDate.getDate(), vm.dayShift.startHour, vm.dayShift.startMinute, 0, 0);
            var endTime = new Date(vm.trackerDate.getFullYear(), vm.trackerDate.getMonth(), vm.trackerDate.getDate(), vm.dayShift.endHour, vm.dayShift.endMinute, 0, 0);
            var cnt = 0;
            while (navTime < endTime && cnt++ < 60) {
                var trackerTime = {
                    time: navTime,
                    label: navTime.getHours().padZero(2) + ":" + navTime.getMinutes().padZero(2),
                    tasks: []
                }
                trackerTime.startTime = angular.copy(navTime);
                navTime.setTime(navTime.getTime() + (vm.trackerIntervel * 60000));
                trackerTime.label += " - " + navTime.getHours().padZero(2) + ":" + navTime.getMinutes().padZero(2);
                trackerTime.endTime = angular.copy(navTime);
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

        vm.getUserDailyTrackerTasks = function () {
            generateTrackerTimes();
            var trackerDate = $filter('date')(vm.trackerDate, "yyyy-MM-dd");
            DailyTrackerService.getUserDailyTrackerTasks({ trackerDate: trackerDate }).then(function (response) {
                vm.dailyTrackerTasks = response.dailyTrackerTasks;
                _.each(vm.trackerTimes, function (trackerTimeObj) {
                    trackerTimeObj.tasks = [];
                });
                _.each(vm.dailyTrackerTasks, function (dailyTrackerObj) {
                    dailyTrackerObj.taskStartTime = new Date(dailyTrackerObj.taskStartTime);
                    dailyTrackerObj.taskEndTime = new Date(dailyTrackerObj.taskEndTime);
                    //dailyTrackerObj.trackerDate = new Date(dailyTrackerObj.trackerDate);
                    _.each(vm.trackerTimes, function (trackerTimeObj) {
                        if (trackerTimeObj.startTime >= dailyTrackerObj.taskStartTime
                            && trackerTimeObj.endTime <= dailyTrackerObj.taskEndTime) {
                            trackerTimeObj.tasks.push(dailyTrackerObj);
                        }
                    });
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.newSlotDailyTrackerForm = function (slot) {
            vm.viewDailyTrackerForm({ taskStartTime: slot.startTime, taskEndTime: slot.endTime });
        }

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
                vm.getUserDailyTrackerTasks();
            }, function () {
                vm.getUserDailyTrackerTasks();
            });
        }

        vm.stopPropagation = function (e) {
            e.stopPropagation();
        }

        vm.delDailyTrackerTask = function (taskObj) {
            if (confirm("Do you want to delete this Daily Tracker Task?")) {
                DailyTrackerService.delDailyTrackerTask(taskObj).then(function (response) {
                    vm.getUserDailyTrackerTasks();
                });
            }
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                getDailyTaskCategories();
                vm.getUserDailyTrackerTasks();
            });
        }
        initController();
    };

    function DailyTrackerFormModel(DailyTrackerService, dailyTrackerObj, dailyTaskCategories, trackerDate, $uibModalInstance, $filter, _, noty) {
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
        if (vm.dailyTrackerObj && vm.dailyTrackerObj.taskCategoryId) {
            vm.dailyTrackerObj.taskCategory = _.find(vm.dailyTaskCategories, { _id: vm.dailyTrackerObj.taskCategoryId });
        }
        vm.saveDailyTracker = function (dailyTrackerForm) {
            if (dailyTrackerForm.$valid) {
                var trackerData = {
                    taskCategoryId: vm.dailyTrackerObj.taskCategory._id,
                    taskShortName: vm.dailyTrackerObj.taskCategory.taskCategoryShortName,
                    trackerDate: $filter('date')(vm.trackerDate, "yyyy-MM-dd")
                };
                trackerData.taskStartTime = $filter('date')(vm.trackerDate, "yyyy-MM-dd") + " " + vm.dailyTrackerObj.taskStartTime.getHours().padZero(2) + ":" + vm.dailyTrackerObj.taskStartTime.getMinutes().padZero(2) + ":00";
                trackerData.taskEndTime = $filter('date')(vm.trackerDate, "yyyy-MM-dd") + " " + vm.dailyTrackerObj.taskEndTime.getHours().padZero(2) + ":" + vm.dailyTrackerObj.taskEndTime.getMinutes().padZero(2) + ":00";
                // trackerData.taskStartTime = vm.dailyTrackerObj.taskStartTime;
                // trackerData.taskEndTime = vm.dailyTrackerObj.taskEndTime;
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
                    //trackerData._id = vm.dailyTrackerObj._id;
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
