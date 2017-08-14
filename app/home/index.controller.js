(function() {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller)
        .controller('Home.TimesheetController', TimesheetController)
        .controller('Home.AdminController', AdminController)
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
                    scope.$on('export-excl',
                        function(e, d) {
                            elem.tableExport({
                                type: 'excel',
                                escape: 'false',
                                ignoreColumn: [4]
                            });
                        });
                    scope.$on('export-doc',
                        function(e, d) {
                            elem.tableExport({
                                type: 'doc',
                                escape: false
                            });
                        });
                }
            };
        })

    function Controller(UserService, $filter, ReportService, _, $scope, FlashService, NgTableParams) {
        var vm = this;

        vm.user = null;
        vm.post = post;
        vm.remind = remind;
        vm.getAllReports = getAllReports;
        vm.exportTable = exportTable;
        vm.remindAll = remindAll;
        vm.closeAlert = closeAlert;
        var currentDay = new Date().getDay();

        vm.obj = {
            question: new Date()
        };

        vm.alerts = [];
        var currentDate = $filter('date')(new Date(), "yyyy-Www").toString();
        vm.currentWeek = new Date();

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
            ReportService.remind(userId, week).then(function(response) {
                vm.alerts.push({ msg: 'User Reminded!' });
            });
        }

        function remindAll() {
            ReportService.remindAll().then(function(response) {
                vm.alerts.push({ msg: 'Users Reminded!' });
            });
        }

        function exportTable() {
            $scope.$broadcast('export-excl', {});
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

        vm.tableParams = new NgTableParams();

        function getAllReports(week) {
            vm.allReports = [];
            var text = "";
            if (week) {
                text = $filter('date')(week, "yyyy-Www").toString();
            } else {
                text = currentDate;
            }
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

    function TimesheetController(UserService, $filter, ReportService, $state, $stateParams) {
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
                    var projects = response.project.split(',');
                    vm.obj.selected = [];
                    for (var i = 0, len = vm.itemArray.length; i < len; i++) {
                        for (var j = 0, size = projects.length; j < size; j++) {
                            if (projects[j] == vm.itemArray[i].name) {
                                vm.obj.selected.push(vm.itemArray[i]);
                            }
                        }
                    }
                }
                vm.obj.hours = response.hours;
                vm.obj.comments = response.comments;
                vm.obj.week = new Date(response.cDate);
            });
        }

        function post(form) {
            var projects = [];
            for (var i = 0, len = vm.obj.selected.length; i < len; i++) {
                projects.push(vm.obj.selected[i].name);
            }
            if (form.$valid && projects.length) {

                var obj = {
                    "week": $filter('date')(vm.obj.week, "yyyy-Www").toString(),
                    "hours": vm.obj.hours,
                    "comments": vm.obj.comments,
                    "cDate": vm.obj.week
                }
                obj.project = projects.toString();

                if (vm.isNew) {
                    ReportService.Create(obj).then(function(response) {
                        vm.alerts.push({ msg: "Thank you for the update", type: 'success' });
                        $state.go('home');
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    ReportService.Update($stateParams.id, obj).then(function(response) {
                        vm.alerts.push({ msg: "Updated Successfully", type: 'success' });
                        $state.go('home');
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

    function AdminController(UserService, $filter, ReportService, $state, $stateParams) {
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
                    var projects = response.project.split(',');
                    vm.obj.selected = [];
                    for (var i = 0, len = vm.itemArray.length; i < len; i++) {
                        for (var j = 0, size = projects.length; j < size; j++) {
                            if (projects[j] == vm.itemArray[i].name) {
                                vm.obj.selected.push(vm.itemArray[i]);
                            }
                        }
                    }
                }
                vm.obj.hours = response.hours;
                vm.obj.comments = response.comments;
                vm.obj.week = new Date(response.cDate);
            });
        }

        function post(form) {
            var projects = [];
            for (var i = 0, len = vm.obj.selected.length; i < len; i++) {
                projects.push(vm.obj.selected[i].name);
            }
            if (form.$valid && projects.length) {

                var obj = {
                    "week": $filter('date')(vm.obj.week, "yyyy-Www").toString(),
                    "hours": vm.obj.hours,
                    "comments": vm.obj.comments,
                    "cDate": vm.obj.week
                }
                obj.project = projects.toString();

                if (vm.isNew) {
                    ReportService.Create(obj).then(function(response) {
                        vm.alerts.push({ msg: "Thank you for the update", type: 'success' });
                        $state.go('home');
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    ReportService.adminUpdate($stateParams.id, obj).then(function(response) {
                        vm.alerts.push({ msg: "Updated Successfully", type: 'success' });
                        $state.go('home');
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