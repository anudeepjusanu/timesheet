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
        });

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
        vm.search = {
            userName: "",
            userResourceType: "",
            projectId: "",
            businessUnit: "",
            resourceType: "",
            isFilled: "",
            timesheetResult: {
                headCount: 0
            }
        };
        vm.resourceTypes = [
            {"resourceTypeId":"", "resourceTypeVal":"All"},
            {"resourceTypeId":"shadow", "resourceTypeVal":"Shadow"},
            {"resourceTypeId":"buffer", "resourceTypeVal":"Buffer"},
            {"resourceTypeId":"billable", "resourceTypeVal":"Billable"},
            {"resourceTypeId":"bizdev", "resourceTypeVal":"Bizdev"},
            {"resourceTypeId":"internal", "resourceTypeVal":"Internal"},
            {"resourceTypeId":"operations", "resourceTypeVal":"Operations"},
            {"resourceTypeId":"trainee", "resourceTypeVal":"Trainee"}
        ];

        vm.alerts = [];
        vm.currentWeek = new Date();
        vm.currentMonth = new Date();
        vm.monthView = false;
        if(vm.currentWeek.getDay() < 5){
            vm.currentWeek.setDate(vm.currentWeek.getDate() - (vm.currentWeek.getDay() + 2));
        }else if(vm.currentWeek.getDay() == 6){
            vm.currentWeek.setDate(vm.currentWeek.getDate() - 1);
        }
        var currentDate = $filter('date')(vm.currentWeek, "yyyy-Www").toString();

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

        $scope.$watch('vm.search.userName', function (newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.userResourceType', function (newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.projectId', function (newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.businessUnit', function (newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.resourceType', function (newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.isFilled', function (newVal) {
            vm.tblUsers = timesheetFilter();
        });

        function timesheetFilter() {
            var output = angular.copy(vm.users);
            var searchObj = vm.search;
            if (searchObj.userName) {
                output = $filter('filter')(output, {userName: searchObj.userName});
            }
            if (searchObj.userResourceType && searchObj.userResourceType.length > 0) {
                output = $filter('filter')(output, function(item){
                    return (searchObj.userResourceType == item.userResourceType);
                });
            }
            if (searchObj.projectId && searchObj.projectId.length > 0) {
                output = $filter('filter')(output, function (item) {
                    item.projects = $filter('filter')(item.projects, {projectId: searchObj.projectId});
                    return (item.projects.length > 0);
                });
            }
            if (searchObj.businessUnit && searchObj.businessUnit.length > 0) {
                output = $filter('filter')(output, function (item) {
                    item.projects = $filter('filter')(item.projects, {businessUnit: searchObj.businessUnit});
                    return (item.projects.length > 0);
                });
            }
            if (searchObj.resourceType && searchObj.resourceType.length > 0) {
                output = $filter('filter')(output, function (item) {
                    item.projects = $filter('filter')(item.projects, {resourceType: searchObj.resourceType});
                    return (item.projects.length > 0);
                });
            }
            if (searchObj.isFilled && searchObj.isFilled.length > 0) {
                if (searchObj.isFilled == "filled") {
                    output = $filter('filter')(output, function (item, index) {
                        return (item.timesheetId != '');
                    });
                } else if (searchObj.isFilled == "notfilled") {
                    output = $filter('filter')(output, function (item, index) {
                        return (item.timesheetId == '');
                    });
                }
            }
            if (output) {
                searchObj.timesheetResult.headCount = output.length;
                searchObj.timesheetResult.totalHours = 0;
                searchObj.timesheetResult.timeoffHours = 0;
                _.each(output, function (sheet) {
                    sheet.totalHours = 0;
                    sheet.timeoffHours = 0;
                    _.each(sheet.projects, function (prj) {
                        sheet.totalHours += prj.projectHours;
                        sheet.timeoffHours += (prj.sickLeaveHours + prj.timeoffHours);
                    });
                    searchObj.timesheetResult.totalHours += sheet.totalHours;
                    searchObj.timesheetResult.timeoffHours += sheet.timeoffHours;
                });
            }
            return output;
        }



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
                        userResourceType: userObj.userResourceType,
                        timesheetId: "",
                        week: "",
                        weekDate: "",
                        projects: [],
                        totalHours: 0,
                        timeoffHours: 0,
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
                            userObj.timeoffHours = timesheet.timeoffHours;
                            if(timesheet.projects.length > 0){
                                userObj.remind = false;
                            }
                        }
                    });
                    /*vm.tableParams.settings({
                        dataset: vm.users
                    });*/
                    vm.tblUsers = angular.copy(vm.users);
                    vm.search = {
                        userName: "",
                        userResourceType: "",
                        projectId: "",
                        businessUnit: "",
                        resourceType: "",
                        isFilled: "",
                        timesheetResult: {
                            headCount: 0
                        }
                    };
                    if (vm.tblUsers) {
                        vm.search.timesheetResult.headCount = vm.tblUsers.length;
                        vm.search.timesheetResult.totalHours = 0;
                        vm.search.timesheetResult.timeoffHours = 0;
                        _.each(vm.tblUsers, function (sheet) {
                            sheet.totalHours = 0;
                            sheet.timeoffHours = 0;
                            _.each(sheet.projects, function (prj) {
                                sheet.totalHours += prj.projectHours;
                                sheet.timeoffHours += (prj.sickLeaveHours + prj.timeoffHours);
                            });
                            vm.search.timesheetResult.totalHours += sheet.totalHours;
                            vm.search.timesheetResult.timeoffHours += sheet.timeoffHours;
                        });
                    }
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
                vm.projects.push({id: '', title:'All'});
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
            totalHours: 0,
            timeoffHours: 0
        };
        vm.hasProjects = true;
        if(vm.timesheet.weekDate.getDay() < 5){
            vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() - (vm.timesheet.weekDate.getDay() + 2));
        }else if(vm.timesheet.weekDate.getDay() == 6){
            vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() - 1);
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
           vm.timesheet.timeoffHours = 0;
           _.each(vm.timesheet.projects, function (project) {
               vm.timesheet.totalHours += project.projectHours;
               vm.timesheet.timeoffHours += project.sickLeaveHours;
               vm.timesheet.timeoffHours += project.timeoffHours;
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
            totalHours: 0,
            timeoffHours: 0
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
            vm.timesheet.timeoffHours = 0;
            _.each(vm.timesheet.projects, function (project) {
                vm.timesheet.totalHours += project.projectHours;
                vm.timesheet.timeoffHours += project.sickLeaveHours;
                vm.timesheet.timeoffHours += project.timeoffHours;
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

    function ConsolidatedController(UserService, TimesheetService, ProjectService, $state, $stateParams, noty, $filter, $scope) {
        var vm = this;
        vm.user = {};
        vm.users = [];
        vm.projects = [];
        vm.timesheets = [];
        vm.currentDate = new Date();
        vm.search = {
            projectId: null,
            startDate: new Date(vm.currentDate.getFullYear(), vm.currentDate.getMonth(), 1),
            endDate: new Date()
        };
        vm.weeks = [];
        vm.dateOptions = {
            startingDay: 1
        };
        vm.exportTable = exportTable;
        calWeeks();

        function exportTable() {
            $scope.$broadcast('export-excl', { "date": vm.filterDate });
        }

        vm.getConsolidatedProjects = function(){
            var paramObj = {projectIds: []};
            paramObj.startDate = $filter('date')(vm.search.startDate, "yyyy-M-dd").toString();
            paramObj.endDate = $filter('date')(vm.search.endDate, "yyyy-M-dd").toString();
            if(vm.search.clientId && vm.search.clientId.length>0){
                paramObj.projectIds = [];
                _.each(vm.projects, function (prjObj) {
                    if(prjObj.clientId == vm.search.clientId){
                        paramObj.projectIds.push(prjObj._id);
                    }
                });
            }else{
                paramObj.projectIds.push(vm.search.projectId);
            }
            calWeeks();
            console.log(vm.weeks);
            TimesheetService.timesheetBetweenDates(paramObj.startDate, paramObj.endDate, paramObj).then(function(response) {
                var rawData = response;
                rawData = _.groupBy(rawData, 'userId');
                vm.resourceTypes = {
                    billable: 0,
                    shadow: 0,
                    bizdev: 0,
                    buffer: 0
                };
                vm.timesheets = [];
                _.each(rawData, function (userSheets, userId) {
                    var userObj = _.find(vm.users, {_id: userId});
                    var userName = (userObj)?userObj.name:"";
                    var projects = [];
                    _.each(userSheets, function (sheetObj) {
                        _.each(sheetObj.projects, function (projectObj) {
                            var projectItem = _.find(projects, {projectId: projectObj.projectId});
                            if(projectItem){
                                projectItem[sheetObj.week] = {
                                    allocatedHours: projectObj.allocatedHours,
                                    billableHours: projectObj.billableHours,
                                    timeoffHours: projectObj.sickLeaveHours + projectObj.timeoffHours,
                                    resourceType: projectObj.resourceType
                                };
                            }else{
                                var newProjectObj = {
                                    projectId: projectObj.projectId,
                                    projectName: projectObj.projectName
                                };
                                var projectInfo = _.find(vm.projects, {_id: projectObj.projectId});
                                if(projectInfo){
                                    newProjectObj.projectName = projectInfo.projectName;
                                }
                                _.each(vm.weeks, function (weekObj) {
                                    newProjectObj[weekObj.week] = {};
                                });
                                newProjectObj[sheetObj.week] = {
                                    allocatedHours: projectObj.allocatedHours,
                                    billableHours: projectObj.billableHours,
                                    timeoffHours: projectObj.sickLeaveHours + projectObj.timeoffHours,
                                    resourceType: projectObj.resourceType
                                };
                                projects.push(newProjectObj);
                            }
                            if(projectObj.resourceType == 'billable'){
                                vm.resourceTypes.billable += projectObj.billableHours;
                            }else if(projectObj.resourceType == 'shadow'){
                                vm.resourceTypes.shadow += projectObj.projectHours;
                            }else if(projectObj.resourceType == 'bizdev'){
                                vm.resourceTypes.bizdev += projectObj.projectHours;
                            }else if(projectObj.resourceType == 'buffer'){
                                vm.resourceTypes.buffer += projectObj.projectHours;
                            }
                        });
                    });
                    var startDateObj = new Date(paramObj.startDate);
                    _.each(projects, function (projectObj) {
                        var userProjectObj = _.find(userObj.projects, {projectId: projectObj.projectId});
                        projectObj.expDays = 90;
                        projectObj.assignDate = "";
                        if(userProjectObj.billDates){
                            userProjectObj.billDates = _.sortBy(userProjectObj.billDates, 'start');
                            _.each(userProjectObj.billDates, function (billDateObj) {
                                if(billDateObj.start){
                                    var billStartDateObj = new Date(billDateObj.start);
                                    projectObj.assignDate = $filter('date')(billStartDateObj, "mediumDate").toString();
                                    //if(startDateObj > billStartDateObj){
                                        projectObj.expDays = startDateObj - billStartDateObj;
                                        projectObj.expDays = parseInt(projectObj.expDays/(1000*60*60*24));
                                    //}
                                }
                            });
                        }
                    });
                    vm.timesheets.push({
                        userId: userId,
                        userName: userName,
                        projects: projects,
                        weeks: userSheets
                    });
                });
                var sno = 1;
                vm.timesheets = _.sortBy(vm.timesheets, 'userName');
                _.each(vm.timesheets, function (sheetObj) {
                    _.each(sheetObj.projects, function (projectObj) {
                        projectObj.totalBillableHours = 0;
                        projectObj.totalTimeoffHours = 0;
                        _.each(vm.weeks, function (weekObj) {
                            if(projectObj[weekObj.week].billableHours){
                                projectObj.totalBillableHours += projectObj[weekObj.week].billableHours;
                            }
                            if(projectObj[weekObj.week].timeoffHours){
                                projectObj.totalTimeoffHours += projectObj[weekObj.week].timeoffHours;
                            }
                        });
                    });
                    sheetObj.sno = sno++;
                });
            }, function(error){
                console.log(error);
            });
        }

        function calWeeks(){
            Date.prototype.getWeek = function() {
                var onejan = new Date(this.getFullYear(), 0, 1);
                return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            }
            vm.weeks = [];
            var startDate = new Date(vm.search.startDate);
            var endDate = new Date(vm.search.endDate);
            var loop = 0;
            while (startDate < endDate && loop++ < 50){
                var weekStartDate = new Date(startDate.getTime());
                weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1);
                var weekEndDate = new Date(startDate.getTime());
                weekEndDate.setDate(weekEndDate.getDate() + (7 - weekEndDate.getDay()));
                //var weekName = $filter('date')(weekStartDate, "mediumDate").toString() + " - " + $filter('date')(weekEndDate, "mediumDate").toString();
                var weekName = $filter('date')(weekEndDate, "mediumDate").toString();
                var weekNumber = "-W";
                if(startDate.getWeek() <= 9){
                    weekNumber = "-W0"+startDate.getWeek();
                }else{
                    weekNumber = "-W"+startDate.getWeek();
                }
                vm.weeks.push({
                    week: startDate.getFullYear()+weekNumber,
                    weekName: weekName
                });
                startDate.setDate(startDate.getDate() + 7);
            }
        }

        function getProjects(){
            ProjectService.getAll().then(function(response) {
                vm.projects = response;
            }, function(error){
                console.log(error);
            });
        }

        function getClients(){
            ProjectService.getClients().then(function(response) {
                vm.clients = response;
            }, function(error){
                console.log(error);
            });
        }

        function getUsers(){
            UserService.GetAll().then(function(response) {
                vm.users = response;
            }, function(error){
                console.log(error);
            });
        }

        init();
        function init() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                getUsers();
                if(vm.user.admin !== true){

                }
                getProjects();
                getClients();
            });
        }
    };

})();