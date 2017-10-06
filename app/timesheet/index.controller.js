(function() {
    'use strict';

    angular
        .module('app')
        .controller('Timesheet.IndexController', Controller)
        .controller('Timesheet.TimesheetController', TimesheetController)

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

    function Controller(UserService, $filter, ReportService, _, $scope, FlashService, NgTableParams, noty) {
        var vm = this;

        vm.user = null;
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
            ReportService.remind(userId, week).then(function(response) {
                noty.showSuccess("User Reminded!")
            });
        }

        function remindAll() {
            ReportService.remindAll().then(function(response) {
                noty.showSuccess("Users Reminded!")
            });
        }

        function exportTable() {
            $scope.$broadcast('export-excl', { "date": vm.filterDate });

            /*var itemsDetailed = [
                [{ text: 'Name', style: 'subheader' }, { text: 'Project', style: 'subheader' },
                    { text: 'Hours', style: 'subheader' }, { text: 'Comments', style: 'subheader' },
                ]
            ];
            
            for(var i=0,len=vm.allReports.length; i<len; i++){
                var reportArr = [];
                if(!vm.allReports[i].comments){
                    vm.allReports[i].comments = ''
                }
                reportArr.push(vm.allReports[i].name, vm.allReports[i].project, vm.allReports[i].hours.toString(), vm.allReports[i].comments);
                itemsDetailed.push(reportArr);
            }
            

            var docDefinition = {
                content: [{
                    text: 'Wavelabs',
                    style: 'header',
                    alignment: 'center'
                }, {
                    text: '\nWeek:' + vm.filterDate
                }, {
                    style: 'demoTable',
                    table: {
                        widths: ['*', '*', '*', '*'],
                        body: itemsDetailed
                    }
                }, {
                    table: {
                        widths: ['*', '*', '*', '*'],
                        body: [
                            ["", "", "", ""]
                        ]
                    }
                }],
                styles: {
                    header: {
                        bold: true,
                        color: '#000',
                        fontSize: 16
                    },
                    subheader: {
                        bold: true,
                        color: '#000',
                        fontSize: 12
                    },
                    demoTable: {
                        color: '#666',
                        fontSize: 10
                    }
                }
            };
            pdfMake.createPdf(docDefinition).download('WeeklyReport.pdf');*/
        }

        function closeAlert(index) {
            vm.alerts.splice(index, 1);
        };

        vm.projects = [
            { id: 'Care', title: 'Care' },
            { id: 'Care Intl', title: 'Care Intl' },
            { id: 'Tapclicks', title: 'Tapclicks' },
            { id: 'SavingStar', title: 'SavingStar' },
            { id: 'BlueSky', title: 'BlueSky' },
            { id: 'Upromise', title: 'Upromise' },
            { id: 'Coding Labs', title: 'Coding Labs' },
            { id: 'Hariome', title: 'Hariome' },
            { id: 'OT', title: 'OT' }
        ];

        vm.tableParams = new NgTableParams({
            count: 100 // hides pager
        }, {

        });

        function getAllReports(week) {
            vm.allReports = [];
            var text = "";
            if (week) {
                text = $filter('date')(week, "yyyy-Www").toString();
            } else {
                text = currentDate;
            }
            vm.filterDate = text;
            UserService.GetAll().then(function(users) {
                vm.users = users;
                for (var i = 0, len = vm.users.length; i < len; i++) {
                    vm.users[i].userId = vm.users[i]._id;
                }
                ReportService.getReportByWeek(text).then(function(reports) {
                    var result = _(vm.users)
                        .differenceBy(reports, 'userId')
                        .map(_.partial(_.pick, _, 'userId', 'name'))
                        .value();
                    for (var i = 0, len = result.length; i < len; i++) {
                        result[i].project = "";
                        result[i].hours = "";
                        result[i].remind = true;
                    }
                    vm.allReports = reports.concat(result);
                    vm.tableParams.settings({
                        dataset: vm.allReports
                    });
                });
            })
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

            ReportService.getReportByMonth(obj).then(function(reports) {
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

        function getMyReport() {
            ReportService.GetMine().then(function(reports) {
                vm.myReports = reports;
            });
        }

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin) {
                    getAllReports();
                } else {
                    getMyReport();
                }
            });
        }
    }

    function TimesheetController(UserService, $filter, ReportService, $state, $stateParams, noty) {
        var vm = this;
        var currentDay = new Date().getDay();
        vm.closeAlert = closeAlert;
        vm.obj = {
            week: new Date()
        };
        switch (currentDay) {
            case 0:
                vm.obj.week.setDate(vm.obj.week.getDate() + 5);
            case 1:
                vm.obj.week.setDate(vm.obj.week.getDate() + 4);
                break;
            case 2:
                vm.obj.week.setDate(vm.obj.week.getDate() + 3);
                break;
            case 3:
                vm.obj.week.setDate(vm.obj.week.getDate() + 2);
                break;
            case 4:
                vm.obj.week.setDate(vm.obj.week.getDate() + 1);
                break;
            case 6:
                vm.obj.week.setDate(vm.obj.week.getDate() - 1);
                break;
            case 7:
                vm.obj.week.setDate(vm.obj.week.getDate() - 2);
                break;
        }

        vm.post = post;
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

        function disabled(data) {
            var date = data.date,
                mode = data.mode;
            return mode === 'day' && (date.getDay() != 5);
        }

        function open2() {
            vm.popup2.opened = true;
        };
        vm.projectsArr = ['Care', 'Care Intl', 'Tapclicks', 'SavingStar', 'BlueSky', 'Upromise', 'Coding Labs', 'Hariome'];
        vm.itemArray = [
            { id: 1, name: 'Care' },
            { id: 2, name: 'Care Intl' },
            { id: 3, name: 'Tapclicks' },
            { id: 4, name: 'SavingStar' },
            { id: 5, name: 'BlueSky' },
            { id: 6, name: 'Upromise' },
            { id: 7, name: 'Coding Labs' },
            { id: 8, name: 'Hariome' },
            { id: 9, name: 'OT' }
        ];

        vm.alerts = [];

        function closeAlert(index) {
            vm.alerts.splice(index, 1);
        };

        function getSheet(id) {
            ReportService.Get(id).then(function(response) {
                if (response.project) {
                    for (var i = 0, len = vm.itemArray.length; i < len; i++) {
                        if (response.project == vm.itemArray[i].name) {
                            vm.obj.project = vm.itemArray[i];
                        }
                    }
                }
                vm.obj.hours = response.hours;
                vm.obj.comments = response.comments;
                vm.obj.week = new Date(response.cDate);
            });
        }

        function post(form) {
            /*var projects = [];
            for (var i = 0, len = vm.obj.selected.length; i < len; i++) {
                projects.push(vm.obj.selected[i].name);
            }*/
            if (form.$valid && vm.obj.project) {

                var obj = {
                    "week": $filter('date')(vm.obj.week, "yyyy-Www").toString(),
                    "hours": vm.obj.hours,
                    "comments": vm.obj.comments,
                    "cDate": vm.obj.week,
                    "project": vm.obj.project.name
                }


                if (vm.isNew) {

                    ReportService.Create(obj).then(function(response) {
                        vm.alerts.push({ msg: "Thank you for the update", type: 'success' });
                        noty.showSuccess("Thank you for the update!");
                        $state.go('timesheet');
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    ReportService.Update($stateParams.id, obj).then(function(response) {
                        //vm.alerts.push({ msg: "Updated Successfully", type: 'success' });
                        noty.showSuccess("Updated Successfully!");
                        $state.go('timesheet');
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }
            } else {
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        }

        initController();

        function initController() {
            if ($stateParams.id) {
                vm.isNew = false;
                getSheet($stateParams.id);
            } else {
                vm.isNew = true;
            }
        }

    }

})();