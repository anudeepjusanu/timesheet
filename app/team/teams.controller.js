(function() {
    'use strict';

    angular
        .module('app')
        .controller('Team.IndexController', TeamsController)
        .controller('Team.LeaveBalanceController', LeaveBalanceController);

    function TeamsController(UserService, _, $state, ProjectService) {
        var vm = this;
        vm.viewProject = viewProject;

        function filterProjects() {
            _.each(vm.user.projects, function(project) {
                if (project.ownerId == vm.user._id) {
                    getUsers(project._id)
                };
            });
        };

        function viewProject() {

        }

        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                filterProjects();
            });
        }
        initController();
    };

    function LeaveBalanceController(UserService, TimesheetService, $filter, noty) {
        var vm = this;
        vm.timesheets = {};
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
            "employeeId": {label: "Employee ID", selected: true},
            "name": {label: "Name", selected: true},
            "userResourceType": {label: "Type", selected: true},
            "phone": {label: "Mobile", selected: false},
            "employeeCategory": {label: "Category", selected: false},
            "employeeType": {label: "Employee Type", selected: false},
            "timeoffHours": {label: "Timeoff Hours", selected: true},
            "timeoffDays": {label: "Timeoff Days", selected: true},
            "isActive": {label: "Status", selected: true}
        };
        vm.sorting = function(orderBy) {
            if (vm.search.orderBy == orderBy) {
                vm.search.sortDESC = !vm.search.sortDESC;
            } else {
                vm.search.sortDESC = false;
            }
            vm.search.orderBy = orderBy;
        };
        var now = new Date();
        vm.financialYears = [];
        vm.financialYear = null;
        var navYear = 2017;
        var endYear = now.getFullYear();
        if(now.getMonth()>=3){
            var endYear = now.getFullYear() + 1;
        }
        while(endYear > navYear){
            var fYear = navYear + "-" + (navYear+1);
            vm.financialYears.push(fYear);
            navYear += 1;
        }
        vm.financialYear = fYear;

        vm.getUserLeaves = function(){
            TimesheetService.usersLeaveBalance(vm.financialYear).then(function(response) {
                if(response){
                    _.each(vm.users, function(userObj){
                        userObj.timeoffHours = 0;
                        userObj.timeoffDays = parseFloat(0).toFixed(2);
                    });
                    _.each(response, function(userSheets){
                        var userObj = _.find(vm.users, {_id: userSheets._id});
                        var timeoffHours = 0.00;
                        var timeoffDays = 0.00;
                        _.each(userSheets.timesheets, function(sheetObj){
                            timeoffHours += parseFloat(sheetObj.timeoffHours);
                        });
                        timeoffDays = parseFloat((timeoffHours/8)).toFixed(2);
                        if(userObj){
                            userObj.userResourceType = userSheets.userResourceType;
                            userObj.timeoffHours = parseFloat(timeoffHours).toFixed(2);
                            userObj.timeoffDays = parseFloat(timeoffDays).toFixed(20);
                            userObj.timesheets = userSheets.timesheets;
                        }
                    });
                }
            }, function(error) {
                console.log(error);
            });
        }
        
        function getUsers() {
            UserService.getUsers().then(function(response) {
                if(response){
                    vm.users = response;
                    vm.getUserLeaves();
                }
            }, function(error) {
                console.log(error);
            });
        }

        function init() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                getUsers();
            });
        }
        init();
    };
})();