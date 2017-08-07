(function() {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller)
        .controller('Home.TimesheetController', TimesheetController)
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

    function Controller(UserService, $filter, ReportService, _, $scope, FlashService) {
        var vm = this;

        vm.user = null;
        vm.post = post;
        vm.remind = remind;
        vm.getAllReports = getAllReports;
        vm.exportTable = exportTable;
        vm.remindAll = remindAll;
        vm.closeAlert = closeAlert;

        vm.obj = {
            question: new Date()
        };
        vm.alerts = [];
        var currentDate = $filter('date')(new Date(), "yyyy-Www").toString();
        vm.currentWeek = new Date();

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

        function getAllReports(week) {
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
                console.log($filter('date')(new Date(), "yyyy-Www"));
                if (vm.user.admin) {
                    getAllReports();
                } else {
                    getMyReport();
                }
            });
        }
    }

    function TimesheetController(UserService, $filter, ReportService, $state) {
        var vm = this;
        vm.obj = {
            week: new Date()
        };
        vm.post = post;

        function post(form) {
            if (form.$valid) {
                var obj = {
                    "project": vm.obj.project,
                    "week": $filter('date')(vm.obj.week, "yyyy-Www").toString(),
                    "hours": vm.obj.hours,
                    "comments": vm.obj.comments
                }
                ReportService.Create(obj).then(function(response) {
                    $state.go('home');
                }, function(error) {

                })
            } else {

            }
        }

    }

})();