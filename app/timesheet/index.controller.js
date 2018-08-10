(function() {
    'use strict';

    angular
        .module('app')
        .controller('Timesheet.IndexController', Controller)
        .controller('Timesheet.MyTimesheetsController', MyTimesheetsController)
        .controller('Timesheet.TimesheetController', TimesheetController)
        .controller('Timesheet.TimesheetModelController', TimesheetModelController)
        .controller('Timesheet.ConsolidatedController', ConsolidatedController)
        //.controller('Timesheet.PoolController', PoolController)

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
        //vm.timesheets = [];
        vm.projects = [];
        vm.post = post;
        vm.remind = remind;
        vm.getAllReports = getAllReports;
        vm.exportTable = exportTable;
        vm.remindAll = remindAll;
        vm.closeAlert = closeAlert;
        vm.getMonthReport = getMonthReport;

        var currentDay = new Date().getDay();
        //vm.toggleView = toggleView;
        //var dayThreshold = [5, 1, 5, 6, 5, 6, 5, 5, 6, 5, 6, 5];
        vm.obj = {
            question: new Date()
        };
        vm.search = {
            userName: "",
            userResourceType: "",
            projectId: "",
            businessUnit: "All",
            resourceType: "",
            timesheetStatus: "",
            isFilled: "",
            timesheetResult: {
                headCount: 0
            }
        };
        vm.resourceTypes = [
            { "resourceTypeId": "", "resourceTypeVal": "All" },
            { "resourceTypeId": "shadow", "resourceTypeVal": "Shadow" },
            { "resourceTypeId": "buffer", "resourceTypeVal": "Buffer" },
            { "resourceTypeId": "billable", "resourceTypeVal": "Billable" },
            { "resourceTypeId": "bizdev", "resourceTypeVal": "Bizdev" },
            { "resourceTypeId": "projectDelivery", "resourceTypeVal": "Project Delivery" },
            { "resourceTypeId": "internal", "resourceTypeVal": "Internal" },
            { "resourceTypeId": "operations", "resourceTypeVal": "Operations" },
            { "resourceTypeId": "trainee", "resourceTypeVal": "Trainee" }
        ];
        vm.projectBusinessUnits = ["All", "Launchpad", "Enterprise", "Operations", "Sales&Marketing", "SAS Products", "R&D", "iCancode-Training", "WL-Training", "Skill Up"];
        vm.alerts = [];
        vm.currentWeek = new Date();
        vm.currentMonth = new Date();
        vm.monthView = false;
        if (vm.currentWeek.getDay() < 5) {
            vm.currentWeek.setDate(vm.currentWeek.getDate() - (vm.currentWeek.getDay() + 2));
        } else if (vm.currentWeek.getDay() == 6) {
            vm.currentWeek.setDate(vm.currentWeek.getDate() - 1);
        }
        var currentDate = $filter('date')(vm.currentWeek, "yyyy-Www").toString();
        vm.newTimesheetVal = [];

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

        $scope.$watch('vm.search.userName', function(newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.userResourceType', function(newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.projectId', function(newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.businessUnit', function(newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.resourceType', function(newVal) {
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.timesheetStatus', function(newVal) {
            console.log("Calling");
            vm.tblUsers = timesheetFilter();
        });

        $scope.$watch('vm.search.isFilled', function(newVal) {
            vm.tblUsers = timesheetFilter();
        });

        function timesheetFilter() {
            var output = angular.copy(vm.users);
            var searchObj = vm.search;
            if (searchObj.userName) {
                output = $filter('filter')(output, { userName: searchObj.userName });
            }
            if (searchObj.userResourceType && searchObj.userResourceType.length > 0) {
                output = $filter('filter')(output, function(item) {
                    return (searchObj.userResourceType == item.userResourceType);
                });
            }
            if (searchObj.projectId && searchObj.projectId.length > 0) {
                output = $filter('filter')(output, function(item) {
                    item.projects = $filter('filter')(item.projects, { projectId: searchObj.projectId });
                    return (item.projects.length > 0);
                });
            }
            if (searchObj.businessUnit && searchObj.businessUnit.length > 0 && searchObj.businessUnit != "All") {
                output = $filter('filter')(output, function(item) {
                    item.projects = $filter('filter')(item.projects, { businessUnit: searchObj.businessUnit });
                    return (item.projects.length > 0);
                });
            }
            if (searchObj.resourceType && searchObj.resourceType.length > 0) {
                output = $filter('filter')(output, function(item) {
                    item.projects = $filter('filter')(item.projects, { resourceType: searchObj.resourceType });
                    return (item.projects.length > 0);
                });
            }
            if (searchObj.timesheetStatus && searchObj.timesheetStatus.length > 0) {
                var timesheetStatus = null;
                if(searchObj.timesheetStatus=='approved'){
                    timesheetStatus = true;
                }else if(searchObj.timesheetStatus=='rejected'){
                    timesheetStatus = false;
                }
                output = $filter('filter')(output, function(item) {
                    return (timesheetStatus === item.timesheetStatus);
                });
            }
            if (searchObj.isFilled && searchObj.isFilled.length > 0) {
                if (searchObj.isFilled == "filled") {
                    output = $filter('filter')(output, function(item, index) {
                        return (item.timesheetId != '');
                    });
                } else if (searchObj.isFilled == "notfilled") {
                    output = $filter('filter')(output, function(item, index) {
                        return (item.timesheetId == '');
                    });
                }
            }
            if (output) {
                searchObj.timesheetResult.headCount = output.length;
                searchObj.timesheetResult.totalHours = 0;
                searchObj.timesheetResult.totalBillableHours = 0;
                searchObj.timesheetResult.timeoffHours = 0;
                searchObj.timesheetResult.overtimeHours = 0;
                _.each(output, function(sheet) {
                    sheet.totalHours = 0;
                    sheet.totalBillableHours = 0;
                    sheet.timeoffHours = 0;
                    sheet.overtimeHours = 0;
                    _.each(sheet.projects, function(prj) {
                        sheet.totalHours += prj.projectHours;
                        sheet.totalBillableHours += prj.billableHours;
                        sheet.timeoffHours += (prj.sickLeaveHours + prj.timeoffHours);
                        if (prj.overtimeHours) {
                            sheet.overtimeHours += prj.overtimeHours;
                        }
                    });
                    searchObj.timesheetResult.totalHours += sheet.totalHours;
                    searchObj.timesheetResult.totalBillableHours += sheet.totalBillableHours;
                    searchObj.timesheetResult.timeoffHours += sheet.timeoffHours;
                    searchObj.timesheetResult.overtimeHours += sheet.overtimeHours;
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
            UserService.getUsers().then(function(users) {
                vm.users = [];
                if(vm.user.admin){
                    _.each(users, function(userObj) {
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
                }else if(vm.user.userRole == 'lead' || vm.user.userRole == 'manager'){
                    var reportingUserId = vm.user._id+"";
                    _.each(users, function(userObj) {
                        if(userObj.reportingTo &&  reportingUserId == userObj.reportingTo){
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
                        }
                    });
                }
                vm.users = _.sortBy(vm.users, ['userName']);
                TimesheetService.getReportByWeek(filterDate).then(function(timesheets) {
                    _.each(timesheets, function(timesheet) {
                        var userObj = _.find(vm.users, { userId: timesheet.userId });
                        if (userObj) {
                            userObj.timesheetId = timesheet._id;
                            userObj.week = timesheet.week;
                            userObj.weekDate = timesheet.weekDate;
                            userObj.totalHours = timesheet.totalHours;
                            userObj.timeoffHours = timesheet.timeoffHours;
                            userObj.reportingTo = timesheet.reportingTo;
                            userObj.timesheetStatus = timesheet.timesheetStatus;
                            userObj.projects = [];
                            _.each(timesheet.projects, function (prjObj) {
                                if(prjObj.projectHours > 0 || prjObj.timeoffHours > 0 || prjObj.sickLeaveHours > 0 || prjObj.corpHolidayHours > 0){
                                    userObj.projects.push(prjObj);
                                }
                            });
                            if (timesheet.projects.length > 0) {
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
                        businessUnit: "All",
                        resourceType: "",
                        timesheetStatus: "",
                        isFilled: "",
                        timesheetResult: {
                            headCount: 0
                        }
                    };
                    if (vm.tblUsers) {
                        vm.search.timesheetResult.headCount = vm.tblUsers.length;
                        vm.search.timesheetResult.totalHours = 0;
                        vm.search.timesheetResult.totalBillableHours = 0;
                        vm.search.timesheetResult.timeoffHours = 0;
                        vm.search.timesheetResult.overtimeHours = 0;
                        _.each(vm.tblUsers, function(sheet) {
                            sheet.totalHours = 0;
                            sheet.totalBillableHours = 0;
                            sheet.timeoffHours = 0;
                            sheet.overtimeHours = 0;
                            _.each(sheet.projects, function(prj) {
                                sheet.totalHours += prj.projectHours;
                                sheet.totalBillableHours += prj.billableHours;
                                sheet.timeoffHours += (prj.sickLeaveHours + prj.timeoffHours);
                                if (prj.overtimeHours) {
                                    sheet.overtimeHours += prj.overtimeHours;
                                }
                            });
                            vm.search.timesheetResult.totalHours += sheet.totalHours;
                            vm.search.timesheetResult.totalBillableHours += sheet.totalBillableHours;
                            vm.search.timesheetResult.timeoffHours += sheet.timeoffHours;
                            vm.search.timesheetResult.overtimeHours += sheet.overtimeHours;
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

        vm.viewUserTimesheet = function(userTimesheet) {
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
                    userTimesheet: function() {
                        return userTimesheet;
                    }
                }
            });

            modalInstance.result.then(function(userObj) {
                vm.getAllReports(vm.currentWeek);
            }, function() {
                vm.getAllReports(vm.currentWeek);
            });
        }

        vm.adminDeleteTimesheet = function(timesheetId) {
            if(confirm("Do you want to delete this timesheet ?")) {
                TimesheetService.deleteTimesheet(timesheetId).then(function (response) {
                    vm.getAllReports(vm.currentWeek);
                });
            }
        }

        function getProjects() {
            ProjectService.getAll().then(function(projects) {
                vm.projects.push({ id: '', title: 'All' });
                _.each(projects, function(project) {
                    vm.projects.push({ id: project._id, title: project.projectName });
                });
            });
        }

        vm.setTimesheetStatus = function(timesheetId){
            if(vm.newTimesheetVal[timesheetId]){
                var newTimesheetVal = null;
                if(vm.newTimesheetVal[timesheetId]=="Approved"){
                    newTimesheetVal = true;
                }else if(vm.newTimesheetVal[timesheetId]=="Rejected"){
                    newTimesheetVal = false;
                }
                _.each(vm.tblUsers, function(userObj){
                    if(timesheetId==userObj.timesheetId){
                        userObj.timesheetStatus = newTimesheetVal;
                        TimesheetService.setTimesheetStatus(timesheetId, {timesheetStatus: newTimesheetVal}).then(function (response) {
                            getAllReports();
                        });
                    }
                });
                vm.newTimesheetVal[timesheetId] = "";
            }
        }

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin || vm.user.userRole == 'lead'|| vm.user.userRole == 'manager') {
                    getAllReports();
                }
                getProjects();
            });
        }
    }

    function MyTimesheetsController(UserService, TimesheetService, ProjectService, $filter, _, $scope, FlashService, NgTableParams, noty, $uibModal) {
        var vm = this;
        vm.user = null;
        vm.timesheets = [];
        //vm.projects = [];
        vm.closeAlert = closeAlert;
        vm.alerts = [];

        function closeAlert(index) {
            vm.alerts.splice(index, 1);
        };

        vm.viewUserTimesheet = function(userTimesheet) {
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
                    userTimesheet: function() {
                        return userTimesheet;
                    }
                }
            });

            modalInstance.result.then(function(userObj) {
                vm.getAllReports(vm.currentWeek);
            }, function() {
                vm.getAllReports(vm.currentWeek);
            });
        }

        vm.deleteTimesheet = function(timesheetId) {
            if(confirm("Do you want to delete this timesheet ?")) {
                TimesheetService.deleteTimesheet(timesheetId).then(function (response) {
                    getMyTimesheets();
                });
            }
        }

        function getMyTimesheets() {
            TimesheetService.getMine().then(function(timesheets) {
                if(timesheets.length > 0){
                    _.each(timesheets, function (timesheetObj) {
                        var tempProjects = timesheetObj.projects;
                        timesheetObj.projects = [];
                        _.each(tempProjects, function (prjObj) {
                            if(prjObj.projectHours > 0 || prjObj.timeoffHours > 0 || prjObj.sickLeaveHours > 0 || prjObj.corpHolidayHours > 0){
                                timesheetObj.projects.push(prjObj);
                            }
                        });
                    });
                }
                vm.timesheets = timesheets;
            });
        }

        // function getProjects() {
        //     ProjectService.getAll().then(function(projects) {
        //         vm.projects.push({ id: '', title: 'All' });
        //         _.each(projects, function(project) {
        //             vm.projects.push({ id: project._id, title: project.projectName });
        //         });
        //     });
        // }

        vm.setTimesheetStatus = function(timesheetId){
            if(vm.newTimesheetVal[timesheetId]){
                var newTimesheetVal = null;
                if(vm.newTimesheetVal[timesheetId]=="Approved"){
                    newTimesheetVal = true;
                }else if(vm.newTimesheetVal[timesheetId]=="Rejected"){
                    newTimesheetVal = false;
                }
                _.each(vm.tblUsers, function(userObj){
                    if(timesheetId==userObj.timesheetId){
                        userObj.timesheetStatus = newTimesheetVal;
                        TimesheetService.setTimesheetStatus(timesheetId, {timesheetStatus: newTimesheetVal}).then(function (response) {
                            getMyTimesheets();
                        });
                    }
                });
                vm.newTimesheetVal[timesheetId] = "";
            }
        }

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                getMyTimesheets();
                //getProjects();
            });
        }
    }

    function TimesheetController(UserService, TimesheetService, ProjectService, $filter, $state, $stateParams, noty) {
        var vm = this;
        var currentDay = new Date().getDay();
        vm.timesheetHours = 0;
        vm.timesheet = {
            weekDate: new Date(),
            projects: [],
            totalHours: 0,
            timeoffHours: 0,
            corpHolidayHours: 0,
            overtimeHours: 0
        };
        vm.hasProjects = true;
        if (vm.timesheet.weekDate.getDay() < 5) {
            vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() - (vm.timesheet.weekDate.getDay() + 2));
        } else if (vm.timesheet.weekDate.getDay() == 6) {
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
        vm.calTotalHours = function() {
            vm.timesheetHours = 0;
            vm.timesheet.totalHours = 0;
            vm.timesheet.timeoffHours = 0;
            vm.timesheet.corpHolidayHours = 0;
            vm.timesheet.overtimeHours = 0;
            _.each(vm.timesheet.projects, function(project) {
                project.overtimeHours = 0;
                if (project.billableMaxHours > 0 && project.projectHours > project.billableMaxHours) {
                    project.overtimeHours = project.projectHours - project.billableMaxHours;
                }
                if(!project.corpHolidayHours){
                    project.corpHolidayHours = 0;
                }
                vm.timesheet.totalHours += project.projectHours;
                vm.timesheet.timeoffHours += project.sickLeaveHours;
                vm.timesheet.timeoffHours += project.timeoffHours;
                vm.timesheet.corpHolidayHours += project.corpHolidayHours;
                vm.timesheet.overtimeHours += project.overtimeHours;
            });
            vm.timesheetHours = vm.timesheet.totalHours + vm.timesheet.timeoffHours + vm.timesheet.corpHolidayHours;
        }

        function getTimesheet(id) {
            TimesheetService.getTimesheet(id).then(function(response) {
                vm.timesheet = response;
                vm.timesheet.weekDate = new Date(vm.timesheet.weekDate);
                vm.calTotalHours();
            });
        }

        vm.saveTimesheet = function(timesheetForm) {
            if (timesheetForm.$valid) {
                if(vm.timesheetHours >= 40){
                    vm.timesheet.week = $filter('date')(vm.timesheet.weekDate, "yyyy-Www").toString();
                    if (vm.isNew) {
                        TimesheetService.createTimesheet(vm.timesheet).then(function(response) {
                            noty.showSuccess("Thank you for the update!");
                            $state.go('myTimesheets');
                        }, function(error) {
                            if (error) {
                                vm.alerts.push({ msg: error, type: 'danger' });
                            }
                        });
                    } else {
                        TimesheetService.updateTimesheet(vm.timesheet._id, vm.timesheet).then(function(response) {
                            noty.showSuccess("Thank you for the update!");
                            if (vm.isPopupEdit) {
                                $uibModalInstance.close();
                            } else {
                                $state.go('myTimesheets');
                            }
                        }, function(error) {
                            if (error) {
                                vm.alerts.push({ msg: error, type: 'danger' });
                            }
                        });
                    }
                }else{
                    vm.alerts.push({ msg: "Total hours must grater than or equal to 40", type: 'danger' });
                }
            }
        }

        vm.closeTimesheet = function() {
            $uibModalInstance.close();
        }

        vm.setAssignedProjects = function() {
            vm.timesheet.projects = [];
            vm.timesheet.totalHours = 0;
            vm.timesheet.timeoffHours = 0;
            vm.timesheet.corpHolidayHours = 0;
            vm.timesheet.overtimeHours = 0;
            vm.timesheet.reportingTo = null;
            vm.timesheet.timesheetStatus = null;
            if(vm.user.reportingTo){
                vm.timesheet.reportingTo = vm.user.reportingTo;
            }
            _.each(vm.user.projects, function(project) {
                var isValidProject = false;
                var BillData = {
                    resourceType: "buffer",
                    allocatedHours: 40,
                    billableMaxHours: 0
                };
                var weekDate = new Date(vm.timesheet.weekDate);
                _.each(project.billDates, function(billDate) {
                    if (billDate.start && billDate.start != "" && billDate.end && billDate.end != "") {
                        var startDate = new Date(billDate.start);
                        var endDate = new Date(billDate.end);
                        if (weekDate >= startDate && weekDate <= endDate) {
                            BillData.resourceType = billDate.resourceType;
                            BillData.allocatedHours = billDate.allocatedHours;
                            BillData.billableMaxHours = billDate.billableMaxHours;
                            isValidProject = true;
                        }
                    } else if (billDate.start && billDate.start != "") {
                        var startDate = new Date(billDate.start);
                        if (weekDate >= startDate) {
                            BillData.resourceType = billDate.resourceType;
                            BillData.allocatedHours = billDate.allocatedHours;
                            BillData.billableMaxHours = billDate.billableMaxHours;
                            isValidProject = true;
                        }
                    } else if (billDate.end && billDate.end != "") {
                        var endDate = new Date(billDate.end);
                        if (weekDate <= endDate) {
                            BillData.resourceType = billDate.resourceType;
                            BillData.allocatedHours = billDate.allocatedHours;
                            BillData.billableMaxHours = billDate.billableMaxHours;
                            isValidProject = true;
                        }
                    } else if (billDate.start == "" && billDate.end == "") {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                        isValidProject = true;
                    }
                });
                BillData.allocatedHours = (!BillData.allocatedHours) ? 0 : BillData.allocatedHours;
                BillData.billableMaxHours = (!BillData.billableMaxHours) ? 0 : BillData.billableMaxHours;

                if (isValidProject === true) {
                    vm.timesheet.projects.push({
                        projectId: project.projectId,
                        projectName: project.projectName,
                        allocatedHours: BillData.allocatedHours,
                        billableMaxHours: BillData.billableMaxHours,
                        projectHours: 0,
                        sickLeaveHours: 0,
                        timeoffHours: 0,
                        corpHolidayHours: 0,
                        overtimeHours: 0,
                        projectComment: "",
                        isAssigned: true
                    });
                }
            });
        }

        // Assign New Project
        vm.clients = [];
        vm.projects = [];
        vm.projectUser = {
            userId: null,
            startDate: new Date(2017, 0, 1),
            billDates: [{
                start: new Date(2017, 0, 1),
                end: "",
                resourceType: "billable",
                startOpened: false,
                endOpened: false
            }]
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

        function getProjects() {
            ProjectService.getAll().then(function(response) {
                vm.projects = response;
                /*_.each(vm.projects, function (prjObj) {
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
                });*/
            }, function(error) {
                console.log(error);
            });
        }

        vm.assignNewProject = function(form) {
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
                vm.setAssignedProjects();
                if ($stateParams.id) {
                    vm.isNew = false;
                    getTimesheet($stateParams.id);
                } else {
                    vm.isNew = true;
                }
                getProjects();
                vm.projectUser.userId = vm.user._id;
                if (vm.user.projects && vm.user.projects.length > 0) {
                    vm.hasProjects = true;
                } else {
                    getClients();
                    vm.hasProjects = false;
                }
                if(vm.user.reportingTo){
                    UserService.GetById(vm.user.reportingTo).then(function(response) {
                        vm.user.reportingUser = {
                            id: response._id,
                            name: response.name
                        };
                    }, function(error) {});
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
            timeoffHours: 0,
            corpHolidayHours: 0,
            overtimeHours: 0
        }
        if (vm.timesheet.weekDate.getDay() < 5) {
            vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() - (vm.timesheet.weekDate.getDay() + 2));
        } else if (vm.timesheet.weekDate.getDay() == 6) {
            vm.timesheet.weekDate.setDate(vm.timesheet.weekDate.getDate() - 1);
        }
        vm.timesheetHours = 0;
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

        vm.calTotalHours = function() {
            vm.timesheetHours = 0;
            vm.timesheet.totalHours = 0;
            vm.timesheet.timeoffHours = 0;
            vm.timesheet.corpHolidayHours = 0;
            vm.timesheet.overtimeHours = 0;
            _.each(vm.timesheet.projects, function(project) {
                project.overtimeHours = 0;
                if (project.billableMaxHours > 0 && project.projectHours > project.billableMaxHours) {
                    project.overtimeHours = project.projectHours - project.billableMaxHours;
                }
                if(!project.corpHolidayHours){
                    project.corpHolidayHours = 0;
                }
                vm.timesheet.totalHours += project.projectHours;
                vm.timesheet.timeoffHours += project.sickLeaveHours;
                vm.timesheet.timeoffHours += project.timeoffHours;
                vm.timesheet.corpHolidayHours += project.corpHolidayHours;
                vm.timesheet.overtimeHours += project.overtimeHours;
            });
            vm.timesheetHours = vm.timesheet.totalHours + vm.timesheet.timeoffHours + vm.timesheet.corpHolidayHours;
        }

        function getTimesheet(id) {
            TimesheetService.getTimesheet(id).then(function(response) {
                vm.timesheet = response;
                vm.timesheet.weekDate = new Date(vm.timesheet.weekDate);
                vm.calTotalHours();
            });
        }

        vm.saveTimesheet = function(timesheetForm) {
            if (timesheetForm.$valid) {
                if(vm.timesheetHours >= 40){
                    vm.timesheet.week = $filter('date')(vm.timesheet.weekDate, "yyyy-Www").toString();
                    if (vm.isNew) {
                        TimesheetService.createTimesheet(vm.timesheet).then(function(response) {
                            noty.showSuccess("Thank you for the update!");
                            $uibModalInstance.close();
                        }, function(error) {
                            if (error) {
                                vm.alerts.push({ msg: error, type: 'danger' });
                            }
                        });
                    } else {
                        TimesheetService.updateTimesheet(vm.timesheet._id, vm.timesheet).then(function(response) {
                            noty.showSuccess("Thank you for the update!");
                            $uibModalInstance.close();
                        }, function(error) {
                            if (error) {
                                vm.alerts.push({ msg: error, type: 'danger' });
                            }
                        });
                    }
                }else{
                    vm.alerts.push({ msg: "Total hours must greater than or equal to 40", type: 'danger' });
                }
            }
        }

        vm.closeTimesheet = function() {
            $uibModalInstance.close();
        }

        vm.setAssignedProjects = function() {
            vm.timesheet.projects = [];
            vm.timesheet.totalHours = 0;
            vm.timesheet.timeoffHours = 0;
            vm.timesheet.overtimeHours = 0;
            _.each(vm.user.projects, function(project) {
                var BillData = {
                    resourceType: "buffer",
                    allocatedHours: 40,
                    billableMaxHours: 0
                };
                var weekDate = new Date(vm.timesheet.weekDate);
                _.each(project.billDates, function(billDate) {
                    if (billDate.start && billDate.start != "" && billDate.end && billDate.end != "") {
                        var startDate = new Date(billDate.start);
                        var endDate = new Date(billDate.end);
                        if (weekDate >= startDate && weekDate <= endDate) {
                            BillData.resourceType = billDate.resourceType;
                            BillData.allocatedHours = billDate.allocatedHours;
                            BillData.billableMaxHours = billDate.billableMaxHours;
                        }
                    } else if (billDate.start && billDate.start != "") {
                        var startDate = new Date(billDate.start);
                        if (weekDate >= startDate) {
                            BillData.resourceType = billDate.resourceType;
                            BillData.allocatedHours = billDate.allocatedHours;
                            BillData.billableMaxHours = billDate.billableMaxHours;
                        }
                    } else if (billDate.end && billDate.end != "") {
                        var endDate = new Date(billDate.end);
                        if (weekDate <= endDate) {
                            BillData.resourceType = billDate.resourceType;
                            BillData.allocatedHours = billDate.allocatedHours;
                            BillData.billableMaxHours = billDate.billableMaxHours;
                        }
                    } else if (billDate.start == "" && billDate.end == "") {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                    }
                });
                BillData.allocatedHours = (!BillData.allocatedHours) ? 0 : BillData.allocatedHours;
                BillData.billableMaxHours = (!BillData.billableMaxHours) ? 0 : BillData.billableMaxHours;

                vm.timesheet.projects.push({
                    projectId: project.projectId,
                    projectName: project.projectName,
                    allocatedHours: BillData.allocatedHours,
                    billableMaxHours: BillData.billableMaxHours,
                    projectHours: 0,
                    sickLeaveHours: 0,
                    timeoffHours: 0,
                    overtimeHours: 0,
                    projectComment: "",
                    isAssigned: true
                });
            });

        }

        function getProjects() {
            ProjectService.getAll().then(function(response) {
                vm.projects = response;
                /*_.each(vm.projects, function (prjObj) {
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
                                overtimeHours: 0,
                                projectComment: "",
                                isAssigned: false
                            });
                        }
                    }
                });*/
            }, function(error) {
                console.log(error);
            });
        }

        initController();

        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                vm.setAssignedProjects();
                if (userTimesheet && userTimesheet._id) {
                    vm.isNew = false;
                    vm.timesheet = userTimesheet;
                    vm.timesheet.weekDate = new Date(vm.timesheet.weekDate);
                    //getTimesheet(userTimesheet._id);
                } else {
                    vm.isNew = true;
                }
                getProjects();
                if (vm.user.projects && vm.user.projects.length > 0) {
                    vm.hasProjects = true;
                } else {
                    vm.hasProjects = false;
                }
            });
        }
    }

    function ConsolidatedController(UserService, TimesheetService, ProjectService, $state, $stateParams, noty, $filter, $scope) {
        var vm = this;
        vm.user = {};
        vm.allUsers = [];
        vm.users = [];
        vm.clients = [];
        vm.projects = [];
        vm.timesheets = [];
        vm.currentDate = new Date();
        vm.resourceTypes = ['billable', 'shadow', 'bizdev', 'buffer'];
        vm.projectBusinessUnits = ["All", "Launchpad", "Enterprise", "Operations", "Sales&Marketing", "SAS Products", "R&D", "iCancode-Training", "WL-Training", "Skill Up"];
        vm.search = {
            userResourceType: "",
            clientId: null,
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

        vm.changeBusinessUnit = function() {

        }

        vm.getConsolidatedProjects = function() {
            var paramObj = { projectIds: [] };
            paramObj.startDate = $filter('date')(vm.search.startDate, "yyyy-M-dd").toString();
            paramObj.endDate = $filter('date')(vm.search.endDate, "yyyy-M-dd").toString();
            if (vm.search.businessUnit.length > 0 && vm.search.businessUnit != 'All') {
                paramObj.projectIds = [];
                _.each(vm.projects, function(prjObj) {
                    if (prjObj.businessUnit == vm.search.businessUnit) {
                        paramObj.projectIds.push(prjObj._id);
                    }
                });
            } else if (vm.search.businessUnit === 'All' || vm.search.clientId === 'all' || vm.search.projectId === 'all') {
                paramObj.projectIds = [];
            } else if (vm.search.clientId && vm.search.clientId.length > 0) {
                paramObj.projectIds = [];
                _.each(vm.projects, function(prjObj) {
                    if (prjObj.clientId == vm.search.clientId) {
                        paramObj.projectIds.push(prjObj._id);
                    }
                });
            } else {
                paramObj.projectIds.push(vm.search.projectId);
            }
            calWeeks();
            if ((vm.search.businessUnit === 'All' || vm.search.clientId === 'all' || vm.search.projectId === 'all') || paramObj.projectIds.length > 0) {

                TimesheetService.timesheetBetweenDates(paramObj.startDate, paramObj.endDate, paramObj).then(function(response) {
                    var rawData = response;
                    rawData = _.groupBy(rawData, 'userId');
                    vm.totalResourceTypes = {};
                    _.each(vm.resourceTypes, function(resourceType) {
                        vm.totalResourceTypes[resourceType] = 0;
                    });
                    vm.users = [];
                    if (vm.search.userResourceType && vm.search.userResourceType.length > 0) {
                        _.each(vm.allUsers, function(userObj) {
                            if (vm.search.userResourceType == userObj.userResourceType) {
                                vm.users.push(userObj);
                            }
                        });
                    } else {
                        vm.users = vm.allUsers;
                    }
                    vm.timesheets = [];
                    _.each(rawData, function(userSheets, userId) {
                        var userObj = _.find(vm.users, { _id: userId });
                        if (userObj) {
                            var userName = (userObj) ? userObj.name : "";
                            var projects = [];
                            _.each(userSheets, function(sheetObj) {
                                _.each(sheetObj.projects, function(projectObj) {
                                    var projectItem = _.find(projects, { projectId: projectObj.projectId });
                                    if (projectItem) {
                                        projectItem[sheetObj.week] = {
                                            allocatedHours: projectObj.allocatedHours,
                                            billableHours: projectObj.billableHours,
                                            timeoffHours: projectObj.sickLeaveHours + projectObj.timeoffHours,
                                            overtimeHours: projectObj.overtimeHours,
                                            resourceType: projectObj.resourceType
                                        };
                                    } else {
                                        var newProjectObj = {
                                            projectId: projectObj.projectId,
                                            projectName: projectObj.projectName,
                                            businessUnit: projectObj.businessUnit
                                        };
                                        var projectInfo = _.find(vm.projects, { _id: projectObj.projectId });
                                        if (projectInfo) {
                                            newProjectObj.projectName = projectInfo.projectName;
                                            newProjectObj.businessUnit = projectInfo.businessUnit;
                                        }
                                        _.each(vm.weeks, function(weekObj) {
                                            newProjectObj[weekObj.week] = {};
                                        });
                                        newProjectObj[sheetObj.week] = {
                                            allocatedHours: projectObj.allocatedHours,
                                            billableHours: projectObj.billableHours,
                                            timeoffHours: projectObj.sickLeaveHours + projectObj.timeoffHours,
                                            overtimeHours: projectObj.overtimeHours,
                                            resourceType: projectObj.resourceType
                                        };
                                        projects.push(newProjectObj);
                                    }
                                    if (vm.totalResourceTypes[projectObj.resourceType] >= 0) {
                                        vm.totalResourceTypes[projectObj.resourceType] += projectObj.billableHours;
                                    }
                                });
                            });
                            var startDateObj = new Date(paramObj.startDate);
                            _.each(projects, function(projectObj) {
                                var userProjectObj = _.find(userObj.projects, { projectId: projectObj.projectId });
                                projectObj.expDays = 90;
                                projectObj.assignDate = "";
                                if (userProjectObj && userProjectObj.billDates) {
                                    userProjectObj.billDates = _.sortBy(userProjectObj.billDates, 'start');
                                    _.each(userProjectObj.billDates, function(billDateObj) {
                                        if (billDateObj.start) {
                                            var billStartDateObj = new Date(billDateObj.start);
                                            projectObj.assignDate = $filter('date')(billStartDateObj, "mediumDate").toString();
                                            //if(startDateObj > billStartDateObj){
                                            projectObj.expDays = startDateObj - billStartDateObj;
                                            projectObj.expDays = parseInt(projectObj.expDays / (1000 * 60 * 60 * 24));
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
                        }
                    });
                    var sno = 1;
                    vm.timesheets = _.sortBy(vm.timesheets, 'userName');
                    _.each(vm.timesheets, function(sheetObj) {
                        _.each(sheetObj.projects, function(projectObj) {
                            projectObj.totalBillableHours = 0;
                            projectObj.totalTimeoffHours = 0;
                            projectObj.totalOvertimeHours = 0;
                            _.each(vm.weeks, function(weekObj) {
                                if (projectObj[weekObj.week].billableHours) {
                                    projectObj.totalBillableHours += projectObj[weekObj.week].billableHours;
                                }
                                if (projectObj[weekObj.week].timeoffHours) {
                                    projectObj.totalTimeoffHours += projectObj[weekObj.week].timeoffHours;
                                }
                                if (projectObj[weekObj.week].overtimeHours) {
                                    projectObj.totalOvertimeHours += projectObj[weekObj.week].overtimeHours;
                                }
                            });
                        });
                        sheetObj.sno = sno++;
                    });
                    _.each(vm.weeks, function(weekObj) {
                        weekObj.resourceTypes = {};
                        _.each(vm.resourceTypes, function(resourceType) {
                            weekObj.resourceTypes[resourceType] = { hours: 0, headCount: 0, userIds: [] };
                            weekObj.weekBillableHours = 0;
                            weekObj.weekTimeoffHours = 0;
                            weekObj.weekOvertimeHours = 0;
                        });
                        _.each(vm.timesheets, function(sheetObj) {
                            _.each(sheetObj.projects, function(projectObj) {
                                var prjWeek = projectObj[weekObj.week];
                                if (weekObj.resourceTypes[prjWeek.resourceType]) {
                                    weekObj.resourceTypes[prjWeek.resourceType].hours += prjWeek.billableHours;
                                    weekObj.resourceTypes[prjWeek.resourceType].headCount += 1;
                                    if (weekObj.resourceTypes[prjWeek.resourceType].userIds.indexOf(sheetObj.userId) == -1) {
                                        weekObj.resourceTypes[prjWeek.resourceType].userIds.push(sheetObj.userId);
                                    }
                                }
                                if (prjWeek.billableHours > 0) weekObj.weekBillableHours += prjWeek.billableHours;
                                if (prjWeek.timeoffHours > 0) weekObj.weekTimeoffHours += prjWeek.timeoffHours;
                                if (prjWeek.overtimeHours > 0) weekObj.weekOvertimeHours += prjWeek.overtimeHours;
                            });
                        });
                        _.each(vm.resourceTypes, function(resourceType) {
                            weekObj.resourceTypes[resourceType].headCount = weekObj.resourceTypes[resourceType].userIds.length;
                        });
                    });
                }, function(error) {
                    console.log(error);
                });
            } else {
                vm.timesheets = [];
            }
        }

        function calWeeks() {
            Date.prototype.getWeek = function() {
                var onejan = new Date(this.getFullYear(), 0, 1);
                return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            }
            vm.weeks = [];
            var startDate = new Date(vm.search.startDate);
            var endDate = new Date(vm.search.endDate);
            var loop = 0;
            while (startDate < endDate && loop++ < 50) {
                var weekStartDate = new Date(startDate.getTime());
                weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1);
                var weekEndDate = new Date(startDate.getTime());
                weekEndDate.setDate(weekEndDate.getDate() + (7 - weekEndDate.getDay()));
                //var weekName = $filter('date')(weekStartDate, "mediumDate").toString() + " - " + $filter('date')(weekEndDate, "mediumDate").toString();
                var weekName = $filter('date')(weekEndDate, "mediumDate").toString();
                var weekNumber = "-W";
                if (startDate.getWeek() <= 9) {
                    weekNumber = "-W0" + startDate.getWeek();
                } else {
                    weekNumber = "-W" + startDate.getWeek();
                }
                vm.weeks.push({
                    week: startDate.getFullYear() + weekNumber,
                    weekName: weekName
                });
                startDate.setDate(startDate.getDate() + 7);
            }
        }

        function getProjects() {
            ProjectService.getAll().then(function(response) {
                vm.projects = [];
                vm.projects.push({
                    _id: 'all',
                    projectName: 'All'
                });
                response = _.sortBy(response, 'projectName');
                _.each(response, function(projectObj) {
                    vm.projects.push({
                        _id: projectObj._id,
                        clientId: projectObj.clientId,
                        businessUnit: projectObj.businessUnit,
                        projectName: projectObj.projectName
                    });
                });
            }, function(error) {
                console.log(error);
            });
        }

        function getClients() {
            ProjectService.getClients().then(function(response) {
                vm.clients = [];
                vm.clients.push({
                    _id: 'all',
                    clientName: 'All'
                });
                response = _.sortBy(response, 'clientName');
                _.each(response, function(clientObj) {
                    vm.clients.push({
                        _id: clientObj._id,
                        clientName: clientObj.clientName
                    });
                });
            }, function(error) {
                console.log(error);
            });
        }

        function getUsers() {
            UserService.getUsers().then(function(response) {
                vm.allUsers = response;
            }, function(error) {
                console.log(error);
            });
        }

        init();

        function init() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                getUsers();
                if (vm.user.admin !== true) {

                }
                getProjects();
                getClients();
            });
        }
    };

    /*function PoolController(UserService, $filter, $scope) {
        var vm = this;
        vm.user = {};
        vm.users = [];
        vm.currentDate = new Date();
        vm.search = {
            startDate: new Date(vm.currentDate.getFullYear(), vm.currentDate.getMonth(), 1),
            endDate: new Date()
        };
        vm.weeks = [];
        vm.dateOptions = {
            startingDay: 1
        };
        vm.exportTable = exportTable;
        //calWeeks();

        function exportTable() {
            $scope.$broadcast('export-excl', { "date": vm.filterDate });
        }

        vm.getPoolUsers = function() {
            var paramObj = {};
            paramObj.startDate = $filter('date')(vm.search.startDate, "yyyy-M-dd").toString();
            paramObj.endDate = $filter('date')(vm.search.endDate, "yyyy-M-dd").toString();
            calWeeks();
            _.each(vm.weeks, function(weekObj) {
                weekObj.users = [];
                _.each(vm.users, function(userObj) {
                    var isFree = false;
                    _.each(userObj.projects, function(projectObj) {
                        projectObj.billDates = _.sortBy(projectObj.billDates, 'start');
                        _.each(projectObj.billDates, function(billDateObj, index) {
                            if (billDateObj.end && billDateObj.end.length > 0) {
                                var billEndDate = new Date(billDateObj.end);
                                var nextIndex = index + 1;
                                var hasNoNextPrj = true;
                                if (projectObj.billDates.length > index && projectObj.billDates[nextIndex] && projectObj.billDates[nextIndex].start) {
                                    var nextBillStartDate = new Date(projectObj.billDates[nextIndex].start);
                                    if (nextBillStartDate >= weekObj.weekStartDate) {
                                        hasNoNextPrj = false;
                                    }
                                }
                                if (weekObj.weekStartDate >= billEndDate && hasNoNextPrj) {
                                    isFree = true;
                                }
                            }
                        });
                    });
                    if (isFree) {
                        weekObj.users.push({
                            userId: userObj._id,
                            userName: userObj.name
                        });
                    }
                });
            });
        }

        function calWeeks() {
            Date.prototype.getWeek = function() {
                var onejan = new Date(this.getFullYear(), 0, 1);
                return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            }
            vm.weeks = [];
            var startDate = new Date(vm.search.startDate);
            var endDate = new Date(vm.search.endDate);
            var loop = 0;
            while (startDate < endDate && loop++ < 50) {
                var weekStartDate = new Date(startDate.getTime());
                weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1);
                var weekEndDate = new Date(startDate.getTime());
                weekEndDate.setDate(weekEndDate.getDate() + (7 - weekEndDate.getDay()));
                //var weekName = $filter('date')(weekStartDate, "mediumDate").toString() + " - " + $filter('date')(weekEndDate, "mediumDate").toString();
                var weekName = $filter('date')(weekEndDate, "mediumDate").toString();
                var weekNumber = "-W";
                if (startDate.getWeek() <= 9) {
                    weekNumber = "-W0" + startDate.getWeek();
                } else {
                    weekNumber = "-W" + startDate.getWeek();
                }
                vm.weeks.push({
                    week: startDate.getFullYear() + weekNumber,
                    weekStartDate: weekStartDate,
                    weekEndDate: weekEndDate,
                    weekName: weekName
                });
                startDate.setDate(startDate.getDate() + 7);
            }
        }

        function getUsers() {
            UserService.getUsers().then(function(response) {
                vm.users = response;
                vm.getPoolUsers();
            }, function(error) {
                console.log(error);
            });
        }

        init();

        function init() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                getUsers();
                if (vm.user.admin !== true) {

                }
            });
        }
    };*/

})();