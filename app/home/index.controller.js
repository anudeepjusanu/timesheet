(function() {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller)
        .controller('Home.SidebarController', SidebarController)
        .controller('Home.AdminUsersController', AdminUsersController)
        .controller('Home.AdminController', AdminController)
        .controller('Home.UserInfoController', UserInfoController)

    function Controller(UserService, TimesheetService, ProjectService, $filter, _, $interval) {
        var vm = this;
        var currentDate;
        vm.widgetDate;
        vm.users = null;
        vm.totalHours = null;
        vm.myHours = null;
        vm.hoursChart = {
            "options": {
                legend: {
                    display: true
                }
            },
            "colors": ['#1caf9a', '#273541']
        };
        vm.manpowerChart = {
            week: "",
            weekDate: new Date(),
            options: {
                legend: {
                    display: true
                }
            },
            colors: ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'],
            data: [],
            labels: []
        };
        if(vm.manpowerChart.weekDate.getDay() < 5){
            vm.manpowerChart.weekDate.setDate(vm.manpowerChart.weekDate.getDate() - (vm.manpowerChart.weekDate.getDay() + 2));
        }else if(vm.manpowerChart.weekDate.getDay() == 6){
            vm.manpowerChart.weekDate.setDate(vm.manpowerChart.weekDate.getDate() - 1);
        }

        vm.projectManpowerChart = {
            options: {
                legend: {
                    display: true
                }
            },
            colors: ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'],
            data: [],
            labels: []
        };
        vm.projects = [];

        vm.dateOptions = {
            dateDisabled: function (data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() != 5);
            },
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            startingDay: 1
        };

        var currentDay = new Date().getDay();
        if (currentDay < 5) {
            var oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            vm.widgetDate = angular.copy(oneWeekAgo);
            currentDate = $filter('date')(oneWeekAgo, "yyyy-Www").toString();
        } else {
            vm.widgetDate = new Date();
            currentDate = $filter('date')(new Date(), "yyyy-Www").toString();
        }

        var tick = function() {
            vm.date = new Date();
        }
        tick();
        $interval(tick, 1000);

        function getUsers() {
            UserService.GetAll().then(function(users) {
                vm.users = users;
                getAllReports();
                getMyReport();
            })
        };

        function getAllReports() {
            TimesheetService.getReportByWeek(currentDate).then(function(reports) {
                vm.totalHours = _.sum(_.map(reports, 'totalHours'));
                vm.currentCapacity = vm.users.length * 40;
                var leave = vm.currentCapacity - vm.totalHours;
                vm.hoursChart.data = [vm.totalHours, leave];
                vm.hoursChart.labels = ["Filled Hours", "Unfilled Hours"];
            });
        };

        function getMyReport() {
            TimesheetService.getMine().then(function(reports) {
                vm.myHours = _.sum(_.map(reports, 'totalHours'));
            });
        };

        function getProjectsWithUserCount() {
            TimesheetService.getProjectsWithUserCount().then(function(projects) {
                vm.projects = projects;
            });
        };

        function getAllUserHoursByweek() {
            var week = $filter('date')(new Date(vm.manpowerChart.weekDate), "yyyy-Www").toString();
            TimesheetService.allUserHoursByWeek(week).then(function(manpowerData) {
                vm.manpowerChart.labels = [];
                vm.manpowerChart.data = [];
                _.each(manpowerData.resourceTypes, function (resourceTypeObj) {
                    vm.manpowerChart.labels.push(resourceTypeObj.resourceType);
                    vm.manpowerChart.data.push(resourceTypeObj.projectHours);
                });
            });
        };

        var init = function() {
            getUsers();
            getProjectsWithUserCount();
            getAllUserHoursByweek(currentDate);
        };

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

    function UserInfoController(UserService, $stateParams, $state, _, noty, ProjectService) {
        var vm = this;
        vm.updateUser = updateUser;
        vm.addProject = addProject;
        vm.deleteProject = deleteProject;
        vm.updateBilling = updateBilling;
        vm.addDate = addDate;
        vm.deleteDate = deleteDate;

        vm.open2 = open2;
        vm.popup2 = {
            opened: false
        };
        vm.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2025, 5, 22),
            startingDay: 1
        };

        function open2(project, text) {
            if (text) {
                project[text] = true;
            } else {
                project.opened = true;
            }
        };

        function getEmployeeInfo() {
            UserService.GetEmployeeInfo($stateParams.id).then(function(employee) {
                vm.employee = employee;
                if (!vm.employee.project) {
                    vm.employee.project = [];
                } else {
                    _.each(vm.employee.project, function(item) {
                        item.opened = false;
                        item.startDate = new Date(item.startDate);
                        if (!item.date) {
                            item.date = [];
                        } else {
                            _.each(item.date, function(dates) {
                                dates.startOpened = false;
                                dates.endOpened = false;
                                if (dates.start)
                                    dates.start = new Date(dates.start);
                                if (dates.end)
                                    dates.end = new Date(dates.end);
                            });
                        }
                    });
                    _.each(vm.projects, function(project) {
                        _.each(vm.employee.project, function(item) {
                            if (item._id == project._id) {
                                item.clientName = project;
                            }
                        });
                    });
                }

            })
        };

        function getAllProjects() {
            ProjectService.getAll().then(function(projects) {
                vm.projects = projects;
                getEmployeeInfo();
            }, function(error) {
                console.log("Error loading projects");
            })
        }

        function addProject() {
            if (!vm.employee.project) {
                vm.employee.project = [];
            } else {
                vm.employee.project.push({
                    "startDate": new Date()
                });
            }
        }

        function deleteProject(index) {
            vm.employee.project.splice(index, 1);
        }

        function addDate(project) {
            if (!project.date) {
                project.date = [{}];
            } else {
                project.date.push({});
            }
        }

        function deleteDate(project, index) {
            project.date.splice(index, 1);
        }

        function updateBilling(project) {
            if (project.isBillable) {
                if (!project.date) {
                    project.date = [{}];
                } else
                    project.date.push({});
            } else {
                project.date = [];
            }
        }

        function updateUser(userForm) {
            if (userForm.$valid) {
                _.each(vm.employee.project, function(project) {
                    delete project.opened;
                    _.each(project.date, function(item) {
                        delete item.startOpened;
                        delete item.endOpened;
                    });
                });
                var obj = {
                    "name": vm.employee.name,
                    "phone": vm.employee.phone,
                    "username": vm.employee.username,
                    "designation": vm.employee.designation,
                    "notifications": vm.employee.notifications
                }
                var projectObj = [];
                _.each(vm.employee.project, function(project) {
                    projectObj.push({
                        "_id": project.clientName._id,
                        "projectName": project.projectName,
                        "clientName": project.clientName.clientName,
                        "startDate": project.startDate,
                        "date": project.date,
                        "isBillable": project.isBillable
                    });
                });
                obj.project = projectObj;

                UserService.UpdateEmployeeInfo($stateParams.id, obj).then(function(employee) {
                    noty.showSuccess("Employee updated Successfully");
                    $state.go('users');
                }, function(error) {
                    noty.showError("Something went wrong!");
                });
            } else {
                noty.showError("Please fill in the required fields");
            }
        }

        function init() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin && $stateParams.id) {
                    vm.isAdmin = true;
                    getAllProjects();
                } else {
                    vm.isAdmin = false;
                    $state.go('home');
                }
            });
        }
        init();
    }

})();