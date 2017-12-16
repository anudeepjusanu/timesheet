(function() {
    'use strict';

    angular
        .module('app')
        .controller('Timesheet.IndexController', Controller)
        .controller('Timesheet.TimesheetController', TimesheetController)
        .controller('Timesheet.TimesheetModelController', TimesheetModelController)
        .controller('Timesheet.ConsolidatedController', ConsolidatedController)

        .directive('exportTable', function() {
            return {
                restrict: 'A',
                link: function(scope, elem, attr) {
                    scope.$on('export-pdf',
                        function(e, d) {
                            elem.tableExport({
                                type: 'pdf',
                                escape: false
                            });
                        });
                    var excel = scope.$on('export-excl',
                        function(e, d) {
                            elem.tableExport({
                                type: 'excel',
                                escape: 'false',
                                ignoreColumn: [4],
                                ignoreRow: [1],
                                worksheetName: d.date
                            });
                        });
                    scope.$on('export-doc',
                        function(e, d) {
                            elem.tableExport({
                                type: 'doc',
                                escape: false
                            });
                        });

                    scope.$on('$destroy', function() {
                        excel();
                    });
                }
            };
        })

    function Controller(UserService, TimesheetService, ProjectService, $filter, _, $scope, FlashService, NgTableParams, noty, $uibModal) {
        var vm = this;

        vm.user = null;
        vm.timesheets = [];
        vm.projects = [];
        vm.post = post;
        vm.remind = remind;
        vm.getAllReports = getAllReports;
        vm.exportTable = exportTable;
        vm.remindAll = remindAll;
        vm.closeAlert = closeAlert;
        vm.getMonthReport = getMonthReport;

        var currentDay = new Date().getDay();
        vm.toggleView = toggleView;
        var dayThreshold = [5, 1, 5, 6, 5, 6, 5, 5, 6, 5, 6, 5];
        vm.obj = {
            question: new Date()
        };

        vm.alerts = [];
        var currentDate = $filter('date')(new Date(), "yyyy-Www").toString();
        vm.currentWeek = new Date();
        vm.currentMonth = new Date();
        vm.monthView = false;

        switch (currentDay) {
            case 0:
                vm.currentWeek.setDate(vm.currentWeek.getDate() + 5);
            case 1:
                vm.currentWeek.setDate(vm.currentWeek.getDate() + 4);
                break;
            case 2:
                vm.currentWeek.setDate(vm.currentWeek.getDate() + 3);
                break;
            case 3:
                vm.currentWeek.setDate(vm.currentWeek.getDate() + 2);
                break;
            case 4:
                vm.currentWeek.setDate(vm.currentWeek.getDate() + 1);
                break;
            case 6:
                vm.currentWeek.setDate(vm.currentWeek.getDate() - 1);
                break;
            case 7:
                vm.currentWeek.setDate(vm.currentWeek.getDate() - 2);
                break;
        }

        vm.open2 = open2;
        vm.popup2 = {
            opened: false
        };
        vm.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            startingDay: 1
        };

        vm.monthOptions = {
            datepickerMode: "month", // Remove Single quotes
            minMode: 'month'
        }

        function disabled(data) {
            var date = data.date,
                mode = data.mode;
            return mode === 'day' && (date.getDay() != 5);
        }

        function open2() {
            vm.popup2.opened = true;
        };

        function post() {
            $filter('date')(vm.obj.question, "yyyy-Www");
        }

        function toggleView(isMonth) {
            vm.monthView = isMonth;
            if (isMonth) {
                vm.getMonthReport(vm.currentMonth);
            }
        }

        function remind(userId) {
            var week = $filter('date')(vm.currentWeek, "Www");
            TimesheetService.remind(userId, week).then(function(response) {
                noty.showSuccess("User Reminded!")
            });
        }

        function remindAll() {
            TimesheetService.remindAll().then(function(response) {
                noty.showSuccess("Users Reminded!")
            });
        }

        function exportTable() {
            $scope.$broadcast('export-excl', { "date": vm.filterDate });
        }

        function closeAlert(index) {
            vm.alerts.splice(index, 1);
        };

        vm.tableParams = new NgTableParams({
            count: 100 // hides pager
        }, {

        });

        function getAllReports(week) {
            var filterDate = "";
            if (week) {
                filterDate = $filter('date')(week, "yyyy-Www").toString();
            } else {
                filterDate = currentDate;
            }
            vm.filterDate = filterDate;
            UserService.GetAll().then(function(users) {
                vm.users = [];
                _.each(users, function (userObj) {
                    vm.users.push({
                        userId: userObj._id,
                        userName: userObj.name,
                        timesheetId: "",
                        week: "",
                        weekDate: "",
                        projects: [],
                        totalHours: "",
                        remind: true
                    });
                });
                vm.users = _.sortBy(vm.users, ['userName']);
                TimesheetService.getReportByWeek(filterDate).then(function(timesheets) {
                    _.each(timesheets, function (timesheet) {
                        var userObj = _.find(vm.users, {userId: timesheet.userId});
                        if(userObj){
                            userObj.timesheetId = timesheet._id;
                            userObj.week = timesheet.week;
                            userObj.weekDate = timesheet.weekDate;
                            userObj.projects = timesheet.projects;
                            userObj.totalHours = timesheet.totalHours;
                            if(timesheet.projects.length > 0){
                                userObj.remind = false;
                            }
                        }
                    });
                    vm.tableParams.settings({
                        dataset: vm.users
                    });
                });
            });
        };

        function weekNumbersRangeInMonth(month, year) {

            year = year || new Date().getFullYear();
            var yearStart = new Date(year, 0, 1); // 1st Jan of the Year

            var first_day_of_month = new Date(year, month, 1);
            var first_week_number = Math.ceil((((first_day_of_month - yearStart) / 86400000) + yearStart.getDay() + 1) / 7);

            var last_day_of_month = new Date(year, month + 1, 0); // Last date of the Month
            var last_week_number = Math.ceil((((last_day_of_month - yearStart) / 86400000) + yearStart.getDay() + 1) / 7);

            return [first_week_number, last_week_number];
        }

        function getMonthReport(mon) {
            var week_no_arr = weekNumbersRangeInMonth(mon.getMonth(), mon.getFullYear());
            var start = week_no_arr[0];
            var end = week_no_arr[1];
            var weeks = [];
            vm.monthColumns = ["Name"];
            while (start <= end) {
                var week = mon.getFullYear() + "-W" + start;
                weeks.push(week);
                start++;
            }
            var obj = {
                "weekArr": weeks
            };
            vm.monthColumns = vm.monthColumns.concat(weeks);

            TimesheetService.getReportByMonth(obj).then(function(reports) {
                for (var i = 0, len = vm.users.length; i < len; i++) {
                    vm.users[i].userId = vm.users[i]._id;
                }
                var rep = _.groupBy(reports, "week");
                vm.groupReports = {};
                _.each(weeks, function(week) {
                    if (!rep[week]) {
                        rep[week] = [];
                    }
                    vm.groupReports[week] = rep[week];
                });

                _.each(vm.users, function(user) {
                    _.each(vm.groupReports, function(item, value) {
                        if (!user.weeks) {
                            user.weeks = [];
                        }
                        var arr = {
                            name: value
                        }
                        _.each(item, function(obj) {
                            if (user.userId == obj.userId) {
                                arr.value = obj
                            }
                        })
                        user.weeks.push(arr);

                    })
                });
            });
        }

        vm.viewUserTimesheet = function (userTimesheet) {
            userTimesheet._id = userTimesheet.timesheetId;
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'timesheet/editTimesheet.html',
                controller: 'Timesheet.TimesheetModelController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    userTimesheet: function () {
                        return userTimesheet;
                    }
                }
            });

            modalInstance.result.then(function (userObj) {
                vm.getAllReports(vm.currentWeek);
            }, function () {
                vm.getAllReports(vm.currentWeek);
            });
        }

        vm.deleteTimesheet = function(timesheetId) {
            TimesheetService.deleteTimesheet(timesheetId).then(function(response) {
                getMyTimesheets();
            });
        }

        function getMyTimesheets() {
            TimesheetService.getMine().then(function(timesheets) {
                vm.timesheets = timesheets;
            });
        }
        
        function getProjects() {
            ProjectService.getAll().then(function(projects) {
                _.each(projects, function (project) {
                    vm.projects.push({id: project._id, title:project.projectName});
                });
            });
        }

        initController();
        function initController() {
            // get current user
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin) {
                    getAllReports();
                }
                getMyTimesheets(); 
                getProjects();
            });
        }
    }

    function TimesheetController(UserService, TimesheetService, ProjectService, $filter, $state, $stateParams, noty) {
        var vm = this;
        var currentDay = new Date().getDay();

        vm.timesheet = {
            weekDate: new Date(),
            projects: [],
            totalHours: 0
        };
        vm.hasProjects = true;
        switch (currentDay) {
            case 0:
                vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() + 5);
            case 1:
                vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() + 4);
                break;
            case 2:
                vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() + 3);
                break;
            case 3:
                vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() + 2);
                break;
            case 4:
                vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() + 1);
                break;
            case 6:
                vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() - 1);
                break;
            case 7:
                vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() - 2);
                break;
        }
        vm.timesheetDateOpened = false;
        vm.dateOptions = {
            dateDisabled: function(data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() != 5);
            },
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            startingDay: 1
        };

        vm.alerts = [];
        vm.closeAlert = function(index) {
            vm.alerts.splice(index, 1);
        };
       vm.calTotalHours = function () {
           vm.timesheet.totalHours = 0;
           _.each(vm.timesheet.projects, function (project) {
               vm.timesheet.totalHours += project.projectHours;
           });
       }

        function getTimesheet(id) {
            TimesheetService.getTimesheet(id).then(function(response) {
                vm.timesheet = response;
                vm.timesheet.weekDate = new Date(vm.timesheet.weekDate);
            });
        }
        
        vm.saveTimesheet = function (timesheetForm) {
            if(timesheetForm.$valid){
                vm.timesheet.week = $filter('date')(vm.timesheet.weekDate, "yyyy-Www").toString();
                if(vm.isNew){
                    TimesheetService.createTimesheet(vm.timesheet).then(function(response) {
                        noty.showSuccess("Thank you for the update!");
                        $state.go('timesheet');
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }else{
                    TimesheetService.updateTimesheet(vm.timesheet._id, vm.timesheet).then(function(response) {
                        noty.showSuccess("Thank you for the update!");
                        if(vm.isPopupEdit){
                            $uibModalInstance.close();
                        }else{
                            $state.go('timesheet');
                        }
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }

            }
        }

        vm.closeTimesheet = function () {
            $uibModalInstance.close();
        }

        function setAssignedProjects() {
            _.each(vm.user.projects, function (project) {
                vm.timesheet.projects.push({
                    projectId: project.projectId,
                    projectName: project.projectName,
                    allocatedHours: project.allocatedHours,
                    projectHours: 0,
                    sickLeaveHours: 0,
                    timeoffHours: 0,
                    projectComment: "",
                    isAssigned: true
                });
            });

        }


        // Assign New Project
        vm.clients = [];
        vm.projects = [];
        vm.projectUser = {
            userId: null,
            startDate: new Date(2017, 0, 1),
            billDates: [
                {
                    start: new Date(2017, 0, 1),
                    end: "",
                    resourceType: "billable",
                    startOpened: false,
                    endOpened: false
                }
            ]
        };
        vm.projectDateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 0, 1),
            startingDay: 1
        };
        vm.enableSaveBtn = true;
        /*vm.resourceTypes = [
            {"resourceTypeId":"shadow", "resourceTypeVal":"Shadow"},
            {"resourceTypeId":"buffer", "resourceTypeVal":"Buffer"},
            {"resourceTypeId":"billable", "resourceTypeVal":"Billable"}
        ];*/

        function getClients() {
            ProjectService.getClients().then(function(response) {
                vm.clients = response;
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        function getProjects(){
            ProjectService.getAll().then(function(response) {
                vm.projects = response;
                _.each(vm.projects, function (prjObj) {
                    if(prjObj.visibility == 'Public'){
                        var prjIndex = _.findIndex(vm.timesheet.projects, {projectId: prjObj._id});
                        if(!(prjIndex >= 0)) {
                            vm.timesheet.projects.push({
                                projectId: prjObj._id,
                                projectName: prjObj.projectName,
                                allocatedHours: prjObj.allocatedHours,
                                projectHours: 0,
                                sickLeaveHours: 0,
                                timeoffHours: 0,
                                projectComment: "",
                                isAssigned: false
                            });
                        }
                    }
                });
            }, function(error){
                console.log(error);
            });
        }

        vm.assignNewProject = function (form) {
            if (form.$valid) {
                vm.enableSaveBtn = false;
                ProjectService.assignUser(vm.projectUser.projectId, vm.projectUser).then(function(response) {
                    noty.showSuccess("New Project has been assigned successfully!");
                    vm.enableSaveBtn = true;
                    $state.go('timesheet');
                }, function(error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                    vm.enableSaveBtn = true;
                    $state.go('timesheet');
                });
            } else {
                vm.enableSaveBtn = true;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                setAssignedProjects();
                if ($stateParams.id) {
                    vm.isNew = false;
                    getTimesheet($stateParams.id);
                } else {
                    vm.isNew = true;
                }
                getProjects();
                vm.projectUser.userId = vm.user._id;
                if(vm.user.projects && vm.user.projects.length > 0){
                    vm.hasProjects = true;
                }else{
                    getClients();
                    vm.hasProjects = false;
                }
            });
        }
    }

    function TimesheetModelController(UserService, TimesheetService, ProjectService, $filter, noty, $uibModalInstance, userTimesheet) {
        var vm = this;
        vm.projects = [];
        vm.alerts = [];
        vm.timesheet = {
            weekDate: new Date(),
            projects: [],
            totalHours: 0
        }
        if(vm.timesheet.weekDate.getDay() < 5){
            vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() - (vm.timesheet.weekDate.getDay() + 2));
        }else if(vm.timesheet.weekDate.getDay() == 6){
            vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() - 1);
        }
        vm.enableSaveBtn = true;
        vm.hasProjects = true;
        vm.timesheetDateOpened = false;
        vm.dateOptions = {
            dateDisabled: function(data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() != 5);
            },
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            startingDay: 1
        }

        vm.closeAlert = function(index) {
            vm.alerts.splice(index, 1);
        }

        vm.calTotalHours = function () {
            vm.timesheet.totalHours = 0;
            _.each(vm.timesheet.projects, function (project) {
                vm.timesheet.totalHours += project.projectHours;
            });
        }

        function getTimesheet(id) {
            TimesheetService.getTimesheet(id).then(function(response) {
                vm.timesheet = response;
                vm.timesheet.weekDate = new Date(vm.timesheet.weekDate);
            });
        }

        vm.saveTimesheet = function (timesheetForm) {
            if(timesheetForm.$valid){
                vm.timesheet.week = $filter('date')(vm.timesheet.weekDate, "yyyy-Www").toString();
                if(vm.isNew){
                    TimesheetService.createTimesheet(vm.timesheet).then(function(response) {
                        noty.showSuccess("Thank you for the update!");
                        $uibModalInstance.close();
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }else{
                    TimesheetService.updateTimesheet(vm.timesheet._id, vm.timesheet).then(function(response) {
                        noty.showSuccess("Thank you for the update!");
                        $uibModalInstance.close();
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }

            }
        }

        vm.closeTimesheet = function () {
            $uibModalInstance.close();
        }

        function setAssignedProjects() {
            _.each(vm.user.projects, function (project) {
                vm.timesheet.projects.push({
                    projectId: project.projectId,
                    projectName: project.projectName,
                    allocatedHours: project.allocatedHours,
                    projectHours: 0,
                    sickLeaveHours: 0,
                    timeoffHours: 0,
                    projectComment: "",
                    isAssigned: true
                });
            });

        }

        function getProjects(){
            ProjectService.getAll().then(function(response) {
                vm.projects = response;
                _.each(vm.projects, function (prjObj) {
                    if(prjObj.visibility == 'Public'){
                        var prjIndex = _.findIndex(vm.timesheet.projects, {projectId: prjObj._id});
                        if(!(prjIndex >= 0)) {
                            vm.timesheet.projects.push({
                                projectId: prjObj._id,
                                projectName: prjObj.projectName,
                                allocatedHours: prjObj.allocatedHours,
                                projectHours: 0,
                                sickLeaveHours: 0,
                                timeoffHours: 0,
                                projectComment: "",
                                isAssigned: false
                            });
                        }
                    }
                });
            }, function(error){
                console.log(error);
            });
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                setAssignedProjects();
                if(userTimesheet && userTimesheet._id){
                    vm.isNew = false;
                    vm.timesheet = userTimesheet;
                    vm.timesheet.weekDate = new Date(vm.timesheet.weekDate);
                    //getTimesheet(userTimesheet._id);
                } else {
                    vm.isNew = true;
                }
                getProjects();
                if(vm.user.projects && vm.user.projects.length > 0){
                    vm.hasProjects = true;
                }else{
                    vm.hasProjects = false;
                }
            });
        }
    }

    function ConsolidatedController(UserService, TimesheetService, ProjectService, $state, $stateParams, noty) {
        var vm = this;
        var currentDay = new Date().getDay();
        vm.user = {};


        init();
        function init() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
            });
        }
    };

})();