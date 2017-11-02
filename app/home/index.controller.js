(function() {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller)
        .controller('Home.SidebarController', SidebarController)
        .controller('Home.AdminUsersController', AdminUsersController)
        .controller('Home.AdminController', AdminController)
        .controller('Home.UserInfoController', UserInfoController)

    function Controller(UserService, ReportService, $filter, _, $interval) {
        var vm = this;
        vm.users = null;
        vm.totalHours = null;
        vm.myHours = null;

        var currentDate = $filter('date')(new Date(), "yyyy-Www").toString();
        vm.projects = [{ id: 1, name: 'Care', 'total': 34 },
            { id: 2, name: 'Care Intl', 'total': 5 },
            { id: 3, name: 'Tapclicks', 'total': 2 },
            { id: 4, name: 'SavingStar', 'total': 4 },
            { id: 5, name: 'BlueSky', 'total': 8 },
            { id: 6, name: 'Upromise', 'total': 1 },
            { id: 7, name: 'Coding Labs', 'total': 5 },
            { id: 8, name: 'Hariome', 'total': 3 },
        ];

        var tick = function() {
            vm.date = new Date();
        }
        tick();
        $interval(tick, 1000);

        function getUsers() {
            UserService.GetAll().then(function(users) {
                vm.users = users;
            })
        }

        function getAllReports(week) {
            ReportService.getReportByWeek(currentDate).then(function(reports) {
                vm.totalHours = _.sum(_.map(reports, 'hours'));
            });
        };

        function getMyReport() {
            ReportService.GetMine().then(function(reports) {
                vm.myHours = _.sum(_.map(reports, 'hours'));
            });
        }

        var init = function() {
            getUsers();
            getAllReports();
            getMyReport();
        }

        init();

    }

    function SidebarController(UserService) {
        var vm = this;
        vm.user = null;

        UserService.GetCurrent().then(function(user) {
            vm.user = user;
        });
    }

    function AdminUsersController(UserService, $filter, ReportService, _, $scope, FlashService, NgTableParams) {
        var vm = this;

        vm.user = null;
        vm.deleteUser = deleteUser;

        vm.tableParams = new NgTableParams({
            count: 100 // hides pager
        }, {

        });

        function deleteUser(id) {
            UserService.Delete(id).then(function(users) {
                getAllUsers();
            });
        }

        function getAllUsers(week) {
            UserService.GetAll().then(function(users) {
                vm.users = users;
                vm.tableParams.settings({
                    dataset: vm.users
                });
            });
        };

        initController();

        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                getAllUsers();
                if (vm.user.admin) {
                    vm.isAdmin = true;
                } else {
                    vm.isAdmin = false;
                }
            });
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

    function UserInfoController(UserService, $stateParams, $state, _, noty) {
        var vm = this;
        vm.updateUser = updateUser;

        function getEmployeeInfo() {
            UserService.GetEmployeeInfo($stateParams.id).then(function(employee) {
                vm.employee = employee;
            })
        };

        function updateUser(userForm) {
            if (userForm.$valid) {
                var obj = {
                    "name": vm.employee.name,
                    "phone": vm.employee.phone,
                    "username": vm.employee.username,
                    "notifications": vm.employee.notifications
                }
                UserService.UpdateEmployeeInfo($stateParams.id, obj).then(function(employee) {
                    noty.showSuccess("Employee updated Successfully");
                    $state.go('users');
                }, function(error){
                    noty.showError("Something went wrong!");
                });
            }else{
                noty.showError("Please fill in the required fields");
            }
        }

        function init() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin && $stateParams.id) {
                    vm.isAdmin = true;
                    getEmployeeInfo();
                } else {
                    vm.isAdmin = false;
                    $state.go('home');
                }
            });
        }
        init();
    }

})();