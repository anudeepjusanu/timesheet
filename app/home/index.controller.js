(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller)
        .controller('Home.SidebarController', SidebarController)
        .controller('Home.AdminUsersController', AdminUsersController)
        .controller('Home.AllUsersController', AllUsersController)
        .controller('Home.SkillProfilesController', SkillProfilesController)
        .controller('Home.UpdateSkillProfileController', UpdateSkillProfileController)
        .controller('Home.AdminController', AdminController)
        .controller('Home.UserInfoController', UserInfoController)
        .controller('Home.UserModelController', UserModelController)
        .controller('Home.ReleaseUserModelController', ReleaseUserModelController)
        .controller('Home.PoolUsersController', PoolUsersController)
        .controller('Home.PoolLogsController', PoolLogsController)
        .filter('allUserSearch', function ($filter) {
            return function (input, searchObj) {
                var output = input;
                if (searchObj.userName && searchObj.userName.length > 0) {
                    output = $filter('filter')(output, { name: searchObj.userName });
                }
                if (searchObj.userResourceType && searchObj.userResourceType.length > 0) {
                    output = $filter('filter')(output, function (item) {
                        return (searchObj.userResourceType == item.userResourceType);
                    });
                }
                if (searchObj.employeeCategory && searchObj.employeeCategory.length > 0 && searchObj.employeeCategory != "All") {
                    output = $filter('filter')(output, function (item) {
                        return (searchObj.employeeCategory == item.employeeCategory);
                    });
                }
                if (searchObj.isAdmin === true || searchObj.isAdmin === false) {
                    output = $filter('filter')(output, function (item) {
                        return (searchObj.isAdmin == item.admin);
                    });
                }
                if (searchObj.resourceStatus && searchObj.resourceStatus.length > 0) {
                    if (searchObj.resourceStatus === "available") {
                        output = $filter('filter')(output, function (item) {
                            return (item.resourceInPool === true);
                        });
                    } else if (searchObj.resourceStatus === "assigned") {
                        output = $filter('filter')(output, function (item) {
                            return (item.resourceInPool !== true);
                        });
                    }
                }

                if (searchObj.skillCategory && searchObj.skillCategory.length > 0 && searchObj.skillCategory != "All") {
                    output = $filter('filter')(output, { skillCategory: searchObj.skillCategory });
                }
                if (searchObj.skillName && searchObj.skillName.length > 0) {
                    var searchCriterias = String(searchObj.skillName).toLowerCase().split(" and ");
                    _.each(searchCriterias, function (searchCriteria) {
                        searchCriteria = String(searchCriteria).trim();
                        searchCriteria.replace(" or ", " ");
                        var skillNameWords = searchCriteria.split(" ");
                        var metaSkillLevels = ["basic", "intermediate", "advanced", "expert"];
                        var skillLevelCriteria = "";
                        _.each(skillNameWords, function (skillNameWord) {
                            skillLevelCriteria = metaSkillLevels.indexOf(skillNameWord.toLowerCase());
                            if (skillLevelCriteria >= 0) {
                                skillLevelCriteria = metaSkillLevels[skillLevelCriteria];
                                skillLevelCriteria = String(skillLevelCriteria).charAt(0).toUpperCase() + String(skillLevelCriteria).substring(1);
                                return true;
                            } else {
                                skillLevelCriteria = "";
                            }
                        });
                        output = $filter('filter')(output, function (item, index) {
                            if (item.userSkills && item.userSkills.length > 0) {
                                var haveRecords = false;
                                _.each(skillNameWords, function (skillNameWord) {
                                    if (skillLevelCriteria != "") {
                                        var skillNameSearch = $filter('filter')(item.userSkills, { 'skillName': skillNameWord, 'skillLevel': skillLevelCriteria });
                                    } else {
                                        var skillNameSearch = $filter('filter')(item.userSkills, { 'skillName': skillNameWord });
                                    }
                                    if (skillNameSearch.length > 0) {
                                        haveRecords = true;
                                        return;
                                    }
                                });
                                if (haveRecords) {
                                    return true;
                                }
                            }
                            return false;
                        });

                    });

                }
                if (searchObj.isActive == 'true' || searchObj.isActive == 'false') {
                    output = $filter('filter')(output, function (item, index) {
                        if (searchObj.isActive == 'true') {
                            return (item.isActive === true);
                        } else if (searchObj.isActive == 'false') {
                            return (item.isActive === false);
                        } else {
                            return true;
                        }
                    });
                }
                return output;
            }
        })

    function Controller(UserService, TimesheetService, ProjectService, $filter, _, $interval, $window) {
        var vm = this;
        var currentDate;
        vm.widgetDate;
        vm.users = null;
        vm.totalHours = null;
        vm.myHours = null;
        vm.monthNames = [
            "January", "February", "March",
            "April", "May", "June",
            "July", "August", "September",
            "October", "November", "December"
        ];
        vm.dateOptions = {
            dateDisabled: function (data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() != 5);
            },
            formatYear: 'yy',
            maxDate: new Date(2030, 12, 31),
            startingDay: 1
        };
        vm.monthOptions = {
            datepickerMode: "month", // Remove Single quotes
            minMode: 'month'
        };
        vm.leaveWalletBalance = {
            accruedLeaves: 0.00,
            creditedLeaves: 0.00,
            deductedLOP: 0.00,
            leaveBalance: 0.00,
            timeoffHours: 0.00,
            timeoffDays: 0.00
        };
        vm.chartColors = ['#803690', '#00ADF9', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360', '#DCDCDC'];
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
            colors: vm.chartColors,
            data: [],
            labels: []
        };
        if (vm.manpowerChart.weekDate.getDay() < 5) {
            vm.manpowerChart.weekDate.setDate(vm.manpowerChart.weekDate.getDate() - (vm.manpowerChart.weekDate.getDay() + 2));
        } else if (vm.manpowerChart.weekDate.getDay() == 6) {
            vm.manpowerChart.weekDate.setDate(vm.manpowerChart.weekDate.getDate() - 1);
        }
        vm.monthHoursChart = {
            week: "",
            weekDate: new Date(),
            options: {
                legend: {
                    display: true
                }
            },
            colors: vm.chartColors,
            data: [],
            series: [],
            labels: []
        };
        vm.monthHeadCountChart = {
            week: "",
            weekDate: new Date(),
            options: {
                legend: {
                    display: true
                }
            },
            colors: vm.chartColors,
            data: [],
            series: [],
            labels: []
        };

        vm.projectManpower = {
            projectId: "",
            week: "",
            weekDate: new Date(),
            options: {
                legend: {
                    display: true
                }
            },
            colors: vm.chartColors,
            data: [],
            labels: []
        };
        if (vm.projectManpower.weekDate.getDay() < 5) {
            vm.projectManpower.weekDate.setDate(vm.projectManpower.weekDate.getDate() - (vm.projectManpower.weekDate.getDay() + 2));
        } else if (vm.projectManpower.weekDate.getDay() == 6) {
            vm.projectManpower.weekDate.setDate(vm.projectManpower.weekDate.getDate() - 1);
        }
        /*vm.projectMonthlyHours = {
            projectId: "",
            week: "",
            weekDate: new Date(),
            options: {
                legend: {
                    display: true
                }
            },
            colors: vm.chartColors,
            data: [],
            series: [],
            labels: []
        };*/

        vm.utzHeadCountChart = {
            week: "",
            options: {
                legend: {
                    display: true
                },
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: { beginAtZero: true }
                    }]
                }
            },
            colors: vm.chartColors,
            data: [],
            series: ["Enterprise", "Launchpad", "NonBillableProject"],
            labels: []
        };
        vm.utzHoursChart = {
            week: "",
            options: {
                legend: {
                    display: true
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: { beginAtZero: true }
                    }]
                }
            },
            colors: vm.chartColors,
            data: [],
            series: ["Enterprise", "Launchpad"],
            labels: []
        };

        vm.utilizationHeadCountChart = {
            week: "",
            options: {
                legend: {
                    display: true
                },
                scales: {
                    yAxes: [{
                        ticks: { beginAtZero: true, max: 100 }
                    }]
                }
            },
            colors: vm.chartColors,
            data: [],
            series: ["Utilization"],
            labels: []
        };
        vm.utilizationHoursChart = {
            week: "",
            options: {
                legend: {
                    display: true
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: { beginAtZero: true, max: 100 }
                    }]
                }
            },
            colors: vm.chartColors,
            data: [],
            series: ["Utilization"],
            labels: []
        };
        vm.utzOrganizationHeadCountChart = {
            week: "",
            options: {
                legend: {
                    display: true
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: { beginAtZero: true, max: 100 }
                    }]
                }
            },
            colors: vm.chartColors,
            data: [],
            series: ["Utilization", "NonBillableProject"],
            labels: []
        };

        vm.projects = [];

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

        var tick = function () {
            vm.date = new Date();
        }
        tick();
        $interval(tick, 1000);

        function getUsers() {
            UserService.getUsers().then(function (users) {
                vm.users = users;
                getAllReports();
                getMyReport();
            })
        };

        function getAllReports() {
            TimesheetService.getReportByWeek(currentDate).then(function (reports) {
                vm.totalHours = _.sum(_.map(reports, 'totalHours'));
                vm.currentCapacity = vm.users.length * 40;
                var leave = vm.currentCapacity - vm.totalHours;
                vm.hoursChart.data = [vm.totalHours, leave];
                vm.hoursChart.labels = ["Filled Hours", "Unfilled Hours"];
            });
        };

        function getMyReport() {
            TimesheetService.getMine().then(function (reports) {
                vm.myHours = _.sum(_.map(reports, 'totalHours'));
            });
        };

        function getProjectsWithUserCount() {
            TimesheetService.getProjectsWithUserCount().then(function (projects) {
                vm.projects = projects;
            });
        };

        vm.getAllUserHoursByWeek = function () {
            var week = $filter('date')(new Date(vm.manpowerChart.weekDate), "yyyy-Www").toString();
            TimesheetService.allUserHoursByWeek(week).then(function (manpowerData) {
                vm.manpowerChart.labels = [];
                vm.manpowerChart.data = [];
                _.each(manpowerData.resourceTypes, function (resourceTypeObj) {
                    vm.manpowerChart.labels.push(resourceTypeObj.resourceType + ' (' + resourceTypeObj.projectUserCount + ')');
                    vm.manpowerChart.data.push(resourceTypeObj.projectHours);
                });
            });
        };

        vm.getProjectUserHoursByWeek = function () {
            if (vm.projectManpower.projectId) {
                var week = $filter('date')(new Date(vm.projectManpower.weekDate), "yyyy-Www").toString();
                TimesheetService.projectUserHoursByWeek(week, vm.projectManpower.projectId).then(function (manpowerData) {
                    vm.projectManpower.labels = [];
                    vm.projectManpower.data = [];
                    _.each(manpowerData.resourceTypes, function (resourceTypeObj) {
                        vm.projectManpower.labels.push(resourceTypeObj.resourceType + ' (' + resourceTypeObj.projectUserCount + ')');
                        vm.projectManpower.data.push(resourceTypeObj.projectHours);
                    });
                });
            }
        };

        vm.getAllUserHoursByMonth = function () {
            vm.utilizationByMonth();
            vm.monthHoursChart.monthName = vm.monthNames[vm.monthHoursChart.weekDate.getMonth()];
            TimesheetService.allUserHoursByMonth(vm.monthHoursChart.weekDate.getMonth(), vm.monthHoursChart.weekDate.getFullYear()).then(function (manpowerData) {
                manpowerData = _.sortBy(manpowerData, 'week');
                vm.monthHoursChart.labels = [];
                vm.monthHoursChart.data = [];
                vm.monthHoursChart.series = [];
                _.each(manpowerData[0].resourceTypes, function (resourceTypeObj) {
                    //vm.monthHoursChart.series.push(resourceTypeObj.resourceType + '('+ resourceTypeObj.projectUserCount +')');
                    vm.monthHoursChart.series.push(resourceTypeObj.resourceType);
                });
                _.each(manpowerData, function (manpower) {
                    vm.monthHoursChart.labels.push(manpower.week + "(" + manpower.totalHours + ")");
                });
                _.each(vm.monthHoursChart.series, function (resourceTypeVal) {
                    var dataObj = [];
                    _.each(manpowerData, function (manpowerObj) {
                        var resourceTypeObj = _.find(manpowerObj.resourceTypes, { "resourceType": resourceTypeVal });
                        if (resourceTypeObj) {
                            dataObj.push(resourceTypeObj.projectHours);
                        }
                    });
                    vm.monthHoursChart.data.push(dataObj);
                });

                vm.monthHeadCountChart.labels = [];
                vm.monthHeadCountChart.data = [];
                vm.monthHeadCountChart.series = [];
                _.each(manpowerData[0].resourceTypes, function (resourceTypeObj) {
                    vm.monthHeadCountChart.series.push(resourceTypeObj.resourceType);
                });
                _.each(manpowerData, function (manpower) {
                    vm.monthHeadCountChart.labels.push(manpower.week + "(" + manpower.totalUserCount + ")");
                });
                _.each(vm.monthHeadCountChart.series, function (resourceTypeVal) {
                    var dataObj = [];
                    _.each(manpowerData, function (manpowerObj) {
                        var resourceTypeObj = _.find(manpowerObj.resourceTypes, { "resourceType": resourceTypeVal });
                        if (resourceTypeObj) {
                            dataObj.push(resourceTypeObj.projectUserCount);
                        }
                    });
                    vm.monthHeadCountChart.data.push(dataObj);
                });
            });
        };

        /*vm.getProjectUserHoursByMonth = function() {
            if(vm.projectMonthlyHours.projectId) {
                TimesheetService.projectUserHoursByMonth(vm.projectMonthlyHours.weekDate.getMonth(), vm.projectMonthlyHours.weekDate.getFullYear(), vm.projectMonthlyHours.projectId).then(function (manpowerData) {
                    manpowerData = _.sortBy(manpowerData, 'week');
                    vm.projectMonthlyHours.labels = [];
                    vm.projectMonthlyHours.data = [];
                    vm.projectMonthlyHours.series = [];
                    _.each(manpowerData[0].resourceTypes, function (resourceTypeObj) {
                        vm.projectMonthlyHours.series.push(resourceTypeObj.resourceType);
                    });
                    _.each(manpowerData, function (manpower) {
                        vm.projectMonthlyHours.labels.push(manpower.week);
                    });
                    _.each(vm.projectMonthlyHours.series, function (resourceTypeVal) {
                        var dataObj = [];
                        _.each(manpowerData, function (manpowerObj) {
                            var resourceTypeObj = _.find(manpowerObj.resourceTypes, {"resourceType": resourceTypeVal});
                            if (resourceTypeObj) {
                                dataObj.push(resourceTypeObj.projectHours);
                            }
                        });
                        vm.projectMonthlyHours.data.push(dataObj);
                    });
                });
            }
        };*/

        vm.utilizationByMonth = function () {
            vm.monthHoursChart.monthName = vm.monthNames[vm.monthHoursChart.weekDate.getMonth()];
            TimesheetService.utilizationByMonth(vm.monthHoursChart.weekDate.getMonth(), vm.monthHoursChart.weekDate.getFullYear()).then(function (resultData) {
                resultData = _.sortBy(resultData, 'week');

                vm.utzHeadCountChart.labels = [];
                vm.utzHeadCountChart.data = [];
                var enterpriseData = [];
                var lanchpadData = [];
                var noBillableProjectData = [];
                _.each(resultData, function (weekData) {
                    vm.utzHeadCountChart.labels.push(weekData.week + "(" + weekData.weekHeadCount + ")");
                    enterpriseData.push(weekData.enterpriseHeadCount);
                    lanchpadData.push(weekData.launchpadHeadCount);
                    noBillableProjectData.push(weekData.haveNoBillableProjectHeadCount);
                });
                vm.utzHeadCountChart.data.push(enterpriseData);
                vm.utzHeadCountChart.data.push(lanchpadData);
                vm.utzHeadCountChart.data.push(noBillableProjectData);

                vm.utzHoursChart.labels = [];
                vm.utzHoursChart.data = [];
                var enterpriseData = [];
                var lanchpadData = [];
                _.each(resultData, function (weekData) {
                    vm.utzHoursChart.labels.push(weekData.week + "(" + weekData.weekBillableHours + ")");
                    enterpriseData.push(weekData.enterpriseBillableHours);
                    lanchpadData.push(weekData.launchpadBillableHours);
                });
                vm.utzHoursChart.data.push(enterpriseData);
                vm.utzHoursChart.data.push(lanchpadData);

                vm.utilizationHeadCountChart.labels = [];
                vm.utilizationHeadCountChart.data = [];
                var utilizationData = [];
                _.each(resultData, function (weekData) {
                    vm.utilizationHeadCountChart.labels.push(weekData.week);
                    var utilizationVal = (weekData.enterpriseHeadCount / weekData.weekHeadCount) * 100;
                    if (isNaN(utilizationVal)) {
                        utilizationVal = 0;
                    }
                    utilizationVal = parseInt(utilizationVal);
                    utilizationData.push(utilizationVal);
                });
                vm.utilizationHeadCountChart.data.push(utilizationData);

                vm.utilizationHoursChart.labels = [];
                vm.utilizationHoursChart.data = [];
                var utilizationData = [];
                _.each(resultData, function (weekData) {
                    vm.utilizationHoursChart.labels.push(weekData.week);
                    var utilizationVal = (weekData.enterpriseBillableHours / weekData.weekBillableHours) * 100;
                    if (isNaN(utilizationVal)) {
                        utilizationVal = 0;
                    }
                    utilizationVal = parseInt(utilizationVal);
                    utilizationData.push(utilizationVal);
                });
                vm.utilizationHoursChart.data.push(utilizationData);
                vm.utzOrganizationHeadCountChart.labels = [];
                vm.utzOrganizationHeadCountChart.data = [];
                var utilizationData = [];
                _.each(resultData, function (weekData) {
                    vm.utzOrganizationHeadCountChart.labels.push(weekData.week);
                    var utilizationVal = (weekData.haveBillableProjectHeadCount / weekData.weekHeadCount) * 100;
                    if (isNaN(utilizationVal)) {
                        utilizationVal = 0;
                    }
                    utilizationVal = parseInt(utilizationVal);
                    utilizationData.push(utilizationVal);
                });
                vm.utzOrganizationHeadCountChart.data.push(utilizationData);

            });
        };

        function savePushToken() {
            UserService.updatePushToken(vm.user)
                .then(function () {
                    //noty.showSuccess("Updated Successfully")
                })
                .catch(function (error) {
                    //FlashService.Error(error);
                });
        }

        function savePushToken() {
            UserService.updatePushToken(vm.user)
                .then(function () {
                    //noty.showSuccess("Updated Successfully")
                })
                .catch(function (error) {
                    //FlashService.Error(error);
                });
        }

        function getMyLeaveWalletBalnce() {
            UserService.getMyLeaveWalletBalance().then(function (response) {
                if (response) {
                    vm.leaveWalletBalance.accruedLeaves = parseFloat(response.accruedLeaves);
                    vm.leaveWalletBalance.creditedLeaves = parseFloat(response.creditedLeaves);
                    vm.leaveWalletBalance.deductedLOP = parseFloat(response.deductedLOP);
                    vm.leaveWalletBalance.leaveBalance = (vm.leaveWalletBalance.accruedLeaves + vm.leaveWalletBalance.creditedLeaves - vm.leaveWalletBalance.deductedLOP);
                }
                TimesheetService.userTakenLeaveBalance(vm.user._id).then(function (response) {
                    if (response) {
                        vm.leaveWalletBalance.timeoffHours = parseFloat(response.totalTimeoffHours);
                        vm.leaveWalletBalance.timeoffDays = parseFloat(response.totalTimeoffDays);
                        vm.leaveWalletBalance.leaveBalance = parseFloat(vm.leaveWalletBalance.accruedLeaves + vm.leaveWalletBalance.creditedLeaves - response.totalTimeoffDays - vm.leaveWalletBalance.deductedLOP).toFixed(2);
                    }
                }).catch(function (error) { });
            }).catch(function (error) {
                //FlashService.Error(error);
            });

        }

        var init = function () {
            getUsers();
            getProjectsWithUserCount();
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                if (vm.user.admin) {
                    vm.getAllUserHoursByWeek();
                    vm.getAllUserHoursByMonth();
                    vm.utilizationByMonth();
                }
                getMyLeaveWalletBalnce();
                if ($window && $window.pushToken && vm.user.pushToken != $window.pushToken) {
                    vm.user.pushToken = $window.pushToken;
                    savePushToken();
                }
            });
        };
        init();
    }

    function SidebarController(UserService) {
        var vm = this;
        vm.user = null;

        UserService.GetCurrent().then(function (user) {
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
            UserService.Delete(id).then(function (users) {
                getAllUsers();
            });
        }

        function getAllUsers(week) {
            var Activeusers = [];
            UserService.GetAll().then(function (users) {
                for (var i = 0; i < users.length; i++) {
                    if (users[i].isActive === true) {
                        Activeusers.push(users[i]);
                    }
                }
                vm.users = Activeusers;
                _.each(vm.users, function (userObj) {
                    if (!(userObj.profileImgUrl) || userObj.profileImgUrl == "") {
                        userObj.profileImgUrl = '/app/app-content/assets/user.jpg';
                    }
                });
                vm.tableParams.settings({
                    dataset: vm.users
                });
            });
        };
        vm.changeStatus = function (event) {
            if (event == true) {
                var Activeusers = [];
                UserService.GetAll().then(function (users) {
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].isActive === true) {
                            Activeusers.push(users[i]);
                        }
                    }
                    vm.users = Activeusers;

                });
            }
            else {
                var InActiveusers = [];
                UserService.GetAll().then(function (users) {
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].isActive === false) {
                            InActiveusers.push(users[i]);
                        }
                    }
                    vm.users = InActiveusers;
                });
            }
        }
        initController();

        function initController() {
            UserService.GetCurrent().then(function (user) {
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

    function AllUsersController(UserService, _, $uibModal, $state, $window, $http, $timeout) {
        var vm = this;
        vm.user = null;
        vm.users = [];
        vm.search = {
            userName: "",
            userResourceType: "",
            userResourceStatus: "",
            employeeCategory: "All",
            isActive: 'true',
            orderBy: 'name',
            sortDESC: false
        };
        vm.userColumns = {
            "name": { label: "Name", selected: true },
            "userResourceType": { label: "Type", selected: true },
            "phone": { label: "Mobile", selected: false },
            "employeeId": { label: "Employee ID", selected: true },
            "joinDate": { label: "Join Date", selected: true },
            "employeeCategory": { label: "Category", selected: true },
            "employeeType": { label: "Employee Type", selected: false },
            "reportingTo": { label: "Reporting To", selected: false },
            "isAdmin": { label: "Is Admin", selected: false },
            "userRole": { label: "Role", selected: false },
            "isActive": { label: "Status", selected: true }
        };

        vm.sorting = function (orderBy) {
            if (vm.search.orderBy == orderBy) {
                vm.search.sortDESC = !vm.search.sortDESC;
            } else {
                vm.search.sortDESC = false;
            }
            vm.search.orderBy = orderBy;
        };

        function deleteUser(id) {
            UserService.Delete(id).then(function (users) {
                getAllUsers();
            });
        }

        function getAllUsers() {
            UserService.GetAll().then(function (users) {
                vm.users = users;
                _.each(vm.users, function (userObj) {
                    if (!(userObj.profileImgUrl) || userObj.profileImgUrl == "") {
                        userObj.profileImgUrl = '/app/app-content/assets/user.jpg';
                    }
                    if (userObj.reportingTo) {
                        var reportUser = _.find(vm.users, { _id: userObj.reportingTo });
                        userObj.reportingUserName = reportUser.name;
                    }
                });
            });
        }

        vm.viewUser = function (user) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'home/editUser.html',
                controller: 'Home.UserModelController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function () {
                        return user;
                    },
                    reportUsers: function () {
                        var reportUsers = [];
                        reportUsers.push({ id: null, name: "None" });
                        _.each(vm.users, function (userObj) {
                            if (userObj.isActive === true && user._id != userObj._id && userObj.userRole && userObj.userRole == "manager") {
                                reportUsers.push({ id: userObj._id, name: userObj.name });
                            }
                        });
                        return reportUsers;
                    }
                }
            });

            modalInstance.result.then(function (userObj) {
                getAllUsers();
            }, function () {
                getAllUsers();
            });
        }

        vm.viewReleaseToPool = function (user) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'home/releaseToPool.html',
                controller: 'Home.ReleaseUserModelController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function () {
                        return user;
                    }
                }
            });
            modalInstance.result.then(function (userObj) {
                getAllUsers();
            }, function () {
                getAllUsers();
            });
        }

        vm.viewReleaseFromPool = function (user) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'home/releaseFromPool.html',
                controller: 'Home.ReleaseUserModelController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function () {
                        return user;
                    }
                }
            });
            modalInstance.result.then(function (userObj) {
                getAllUsers();
            }, function () {
                getAllUsers();
            });
        }

        vm.stopPropagation = function (e) {
            e.stopPropagation();
        }

        vm.loginAsUser = function (userObj) {
            console.log(userObj);
            UserService.loginAsUser({ username: userObj.username }).then(function (data) {
                if (data && data.token) {
                    $window.jwtToken = data.token;
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;
                    $timeout(function () {
                        //$state.go('home');
                        console.log(window.location.origin);
                        window.location = window.location.origin + '/app/';
                    });
                }
            }, function (error) {
                console.log(error);
                noty.showError(error)
            });
        }

        initController();

        function initController() {
            UserService.GetCurrent().then(function (user) {
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

    function SkillProfilesController(UserService, AppConfigService, _, $uibModal, $state, $window, $http, $timeout, noty) {
        var vm = this;
        vm.user = null;
        vm.users = [];
        vm.metaSkills = [];

        vm.search = {
            userName: "",
            userResourceType: "",
            userResourceStatus: "",
            employeeCategory: "All",
            isActive: 'true',
            orderBy: 'name',
            sortDESC: false
        };

        vm.userColumns = {
            "name": { label: "Name", selected: true },
            "userResourceType": { label: "Type", selected: true },
            "isAdmin": { label: "Is Admin", selected: false },
            "resourceStatus": { label: "Resource Status", selected: true },
            "isActive": { label: "Status", selected: true }
        };

        vm.sorting = function (orderBy) {
            if (vm.search.orderBy == orderBy) {
                vm.search.sortDESC = !vm.search.sortDESC;
            } else {
                vm.search.sortDESC = false;
            }
            vm.search.orderBy = orderBy;
        };

        vm.viewUserSkillProfile = function (userObj, userSkillObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'home/editSkillProfile.html',
                controller: 'Home.UpdateSkillProfileController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    metaSkills: function () {
                        return vm.metaSkills;
                    },
                    userObj: function () {
                        return userObj;
                    },
                    userSkillObj: function () {
                        return userSkillObj;
                    }
                }
            });

            modalInstance.result.then(function (userObj) {
                vm.getAllUserSkillProfiles();
            }, function () {
                vm.getAllUserSkillProfiles();
            });
        }

        vm.delUserSkillProfile = function (userSkillObj) {
            if (confirm("Do you want to delete this skill ?")) {
                UserService.deleteUserSkill(userSkillObj._id).then(function (response) {
                    noty.showSuccess("User skill has been deleted successfully!");
                    vm.getAllUserSkillProfiles();
                }, function (error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                    vm.getAllUserSkillProfiles();
                });
            }
        }

        vm.stopPropagation = function (e) {
            e.stopPropagation();
        }

        vm.getAllUserSkillProfiles = function () {
            UserService.getAllUserSkillProfiles().then(function (data) {
                if (data.users) {
                    vm.users = data.users;
                }
            }, function (error) {
                noty.showError(error)
            });
        }

        vm.getMetaSkills = function () {
            AppConfigService.getMetaSkills().then(function (data) {
                if (data.metaSkills) {
                    vm.metaSkills = data.metaSkills;
                    vm.metaSkills.push({ skillName: "Other" });
                }
            }, function (errors) {
                console.log(errors);
            });
        }




        initController();
        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                if (vm.user.admin) {
                    vm.isAdmin = true;
                } else {
                    vm.isAdmin = false;
                    $state.go('home');
                }
                vm.getAllUserSkillProfiles();
                vm.getMetaSkills();
            });
        }
    }

    function UpdateSkillProfileController(UserService, userObj, metaSkills, userSkillObj, noty, $uibModalInstance) {
        var vm = this;
        vm.userObj = userObj;
        vm.metaSkills = metaSkills;
        vm.userSkillObj = {};
        vm.alerts = [];
        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }
        vm.closeUser = function () {
            $uibModalInstance.close();
        }
        vm.metaSkillLevels = ["Basic", "Intermediate", "Advanced", "Expert"];
        if (userSkillObj) {
            vm.userSkillObj = userSkillObj;
        }

        vm.saveUserSkillProfile = function (userForm) {
            if (userForm.$valid) {
                var userSkillObj = {
                    userId: vm.userObj._id,
                    skillName: vm.userSkillObj.skillName,
                    skillVersion: vm.userSkillObj.skillVersion,
                    skillLevel: vm.userSkillObj.skillLevel,
                };
                if (vm.userSkillObj._id) {
                    UserService.updateUserSkill(vm.userSkillObj._id, userSkillObj).then(function (response) {
                        noty.showSuccess("User skill has been updated successfully!");
                        $uibModalInstance.close();
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    UserService.addUserSkill(userSkillObj).then(function (response) {
                        noty.showSuccess("User skill has been added successfully!");
                        $uibModalInstance.close();
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }
            }
        }

        init();
        function init() {

        }
    }

    function UserModelController(UserService, $filter, noty, $uibModalInstance, user, reportUsers) {
        var vm = this;
        vm.userObj = user;
        vm.alerts = [];
        vm.userRoles = [];
        vm.reportUsers = reportUsers;
        vm.enableSaveBtn = true;
        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }
        vm.joinDateOpened = false;
        vm.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2030, 12, 31),
            startingDay: 1
        };
        vm.employeeTypes = [
            { id: "InternalEmployee", label: "Internal Employee" },
            { id: "InternalContractor", label: "Internal Contractor" },
            { id: "ExternalContractor", label: "External Contractor" }
        ]
        if (vm.userObj.joinDate) {
            vm.userObj.joinDate = new Date(vm.userObj.joinDate);
        }
        vm.saveUser = function (userForm) {
            if (userForm.$valid) {
                var obj = {
                    "name": vm.userObj.name,
                    "phone": vm.userObj.phone,
                    "username": vm.userObj.username,
                    "employeeId": vm.userObj.employeeId,
                    "joinDate": $filter('date')(vm.userObj.joinDate, "yyyy-MM-dd"),
                    "designation": vm.userObj.designation,
                    "userResourceType": vm.userObj.userResourceType,
                    "employeeType": vm.userObj.employeeType,
                    "userRole": vm.userObj.userRole,
                    "reportingTo": vm.userObj.reportingTo,
                    "employeeCategory": vm.userObj.employeeCategory,
                    "profileImgUrl": vm.userObj.profileImgUrl,
                    "isActive": vm.userObj.isActive
                }
                UserService.UpdateEmployeeInfo(vm.userObj._id, obj).then(function (response) {
                    noty.showSuccess("User has been updated successfully!");
                    $uibModalInstance.close();
                }, function (error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                });
            }
        }
        vm.employeeCategories = ["C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"];

        vm.closeUser = function () {
            $uibModalInstance.close();
        }

        init();

        function init() {
            vm.userRoles = UserService.getUserRoles();
        }
    }

    function ReleaseUserModelController(UserService, $filter, noty, $uibModalInstance, user) {
        var vm = this;
        vm.userObj = user;
        vm.alerts = [];
        vm.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2030, 12, 31),
            startingDay: 1
        };
        vm.sinceDateOpened = false;
        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        vm.toPool = function (userForm) {
            if (userForm.$valid) {
                var obj = {
                    "resourceInPool": true,
                    "poolSinceDate": vm.userObj.poolSinceDate,
                    "poolName": vm.userObj.poolName
                }
                UserService.releaseToPool(vm.userObj._id, obj).then(function (response) {
                    noty.showSuccess("User has been release to pool successfully!");
                    $uibModalInstance.close();
                }, function (error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                });
            }
        }

        vm.fromPool = function (userForm) {
            UserService.releaseFromPool(vm.userObj._id).then(function (response) {
                noty.showSuccess("User has been release from pool successfully!");
                $uibModalInstance.close();
            }, function (error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.closeUser = function () {
            $uibModalInstance.close();
        }

        init();

        function init() {

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
            maxDate: new Date(2030, 12, 31),
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
            ReportService.Get(id).then(function (response) {
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
                    ReportService.Create(obj).then(function (response) {
                        vm.alerts.push({ msg: "Thank you for the update", type: 'success' });
                        $state.go('home');
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    ReportService.adminUpdate($stateParams.id, obj).then(function (response) {
                        vm.alerts.push({ msg: "Updated Successfully", type: 'success' });
                        $state.go('home');
                    }, function (error) {
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
            UserService.GetEmployeeInfo($stateParams.id).then(function (employee) {
                vm.employee = employee;
                if (!vm.employee.project) {
                    vm.employee.project = [];
                } else {
                    _.each(vm.employee.project, function (item) {
                        item.opened = false;
                        item.startDate = new Date(item.startDate);
                        if (!item.date) {
                            item.date = [];
                        } else {
                            _.each(item.date, function (dates) {
                                dates.startOpened = false;
                                dates.endOpened = false;
                                if (dates.start)
                                    dates.start = new Date(dates.start);
                                if (dates.end)
                                    dates.end = new Date(dates.end);
                            });
                        }
                    });
                    _.each(vm.projects, function (project) {
                        _.each(vm.employee.project, function (item) {
                            if (item._id == project._id) {
                                item.clientName = project;
                            }
                        });
                    });
                }

            })
        };

        function getAllProjects() {
            ProjectService.getAll().then(function (projects) {
                vm.projects = projects;
                getEmployeeInfo();
            }, function (error) {
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
                _.each(vm.employee.project, function (project) {
                    delete project.opened;
                    _.each(project.date, function (item) {
                        delete item.startOpened;
                        delete item.endOpened;
                    });
                });
                var obj = {
                    "name": vm.employee.name,
                    "phone": vm.employee.phone,
                    "username": vm.employee.username,
                    "employeeId": vm.employee.employeeId,
                    "designation": vm.employee.designation,
                    "userResourceType": vm.employee.userResourceType,
                    "isActive": vm.employee.isActive
                }
                var projectObj = [];
                _.each(vm.employee.project, function (project) {
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

                UserService.UpdateEmployeeInfo($stateParams.id, obj).then(function (employee) {
                    noty.showSuccess("Employee updated Successfully");
                    $state.go('users');
                }, function (error) {
                    noty.showError("Something went wrong!");
                });
            } else {
                noty.showError("Please fill in the required fields");
            }
        }

        function init() {
            UserService.GetCurrent().then(function (user) {
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

    function PoolUsersController(UserService, _, $uibModal) {
        var vm = this;
        vm.showAllUsers = false;
        vm.users = [];
        vm.search = {
            userName: "",
            userResourceType: "",
            isActive: "",
            poolSinceDays: "",
            orderBy: 'name',
            sortDESC: false
        };

        vm.sorting = function (orderBy) {
            if (vm.search.orderBy == orderBy) {
                vm.search.sortDESC = !vm.search.sortDESC;
            } else {
                vm.search.sortDESC = false;
            }
            vm.search.orderBy = orderBy;
        };

        vm.getAllUsers = function () {
            vm.users = [];
            UserService.GetAll().then(function (users) {
                _.each(users, function (userObj) {
                    if (userObj.isActive == true) {
                        if (vm.showAllUsers === true) {
                            userObj.poolSince = vm.calWeeksSinceNow(userObj.poolSinceDate);
                            userObj.poolSinceDays = vm.calDaysSinceNow(userObj.poolSinceDate);
                            vm.users.push(userObj);
                        } else if (vm.showAllUsers === false && userObj.resourceInPool === true) {
                            userObj.poolSince = vm.calWeeksSinceNow(userObj.poolSinceDate);
                            userObj.poolSinceDays = vm.calDaysSinceNow(userObj.poolSinceDate);
                            vm.users.push(userObj);
                        }
                    }

                    if (!(userObj.profileImgUrl) || userObj.profileImgUrl == "") {
                        userObj.profileImgUrl = '/app/app-content/assets/user.jpg';
                    }

                });
            });
        }

        vm.viewUserPoolLog = function (user) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'home/userPoolLogs.html',
                controller: 'Home.PoolLogsController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function () {
                        return user;
                    }
                }
            });
            modalInstance.result.then(function (userObj) {

            }, function () {

            });
        }

        vm.viewReleaseToPool = function (user) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'home/releaseToPool.html',
                controller: 'Home.ReleaseUserModelController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function () {
                        return user;
                    }
                }
            });
            modalInstance.result.then(function (userObj) {
                vm.getAllUsers();
            }, function () {
                vm.getAllUsers();
            });
        }

        vm.viewReleaseFromPool = function (user) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'home/releaseFromPool.html',
                controller: 'Home.ReleaseUserModelController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function () {
                        return user;
                    }
                }
            });
            modalInstance.result.then(function (userObj) {
                vm.getAllUsers();
            }, function () {
                vm.getAllUsers();
            });
        }

        vm.calWeeksSinceNow = function (sinceDate) {
            if (sinceDate && sinceDate.length > 0) {
                var oneDay = 24 * 60 * 60 * 1000;
                var oneWeek = 7 * 24 * 60 * 60 * 1000;
                var now = new Date();
                var sinceDate = new Date(sinceDate);
                var diff = parseInt((now - sinceDate) / oneWeek);
                return diff + " Weeks";
            } else {
                return "";
            }
        }

        vm.calDaysSinceNow = function (sinceDate) {
            if (sinceDate && sinceDate.length > 0) {
                var oneDay = 24 * 60 * 60 * 1000;
                var oneWeek = 7 * 24 * 60 * 60 * 1000;
                var now = new Date();
                var sinceDate = new Date(sinceDate);
                var diff = parseInt((now - sinceDate) / oneDay);
                return diff;
            } else {
                return 0;
            }
        }

        initController();

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                if (vm.user.admin) {
                    vm.isAdmin = true;
                } else {
                    vm.isAdmin = false;
                }
                vm.getAllUsers();
            });
        }
    }

    function PoolLogsController(UserService, _, $uibModalInstance, user) {
        var vm = this;
        vm.user = user;
        vm.logs = [];

        function getUserPoolLogs(userId) {
            vm.logs = [];
            UserService.userPoolLogs(vm.user._id).then(function (logs) {
                vm.logs = logs;
            });
        }

        vm.close = function () {
            $uibModalInstance.close();
        }

        vm.calWeeksSinceEnd = function (sinceDate, endDate) {
            if (sinceDate && sinceDate.length > 0) {
                var oneDay = 24 * 60 * 60 * 1000;
                var oneWeek = 7 * 24 * 60 * 60 * 1000;
                var now = new Date();
                var sinceDate = new Date(sinceDate);
                var diff = parseInt((now - sinceDate) / oneWeek);
                return diff + " Weeks";
            } else {
                return "";
            }
        }

        initController();

        function initController() {
            getUserPoolLogs(vm.user._id);
        }
    }

})();