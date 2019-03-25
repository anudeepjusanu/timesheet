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
            "joinDate": {label: "Join Date", selected: true},
            "employeeCategory": {label: "Category", selected: false},
            "employeeType": {label: "Employee Type", selected: false},
            "leaveWallet": {label: "Leave Wallet", selected: true},
            "timeoffHours": {label: "Timeoff Hours", selected: true},
            "timeoffDays": {label: "Timeoff Days", selected: true},
            "isActive": {label: "Status", selected: true},
            "leaveWeeks": {label: "Leave Weeks", selected: true}
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
                        userObj.timeoffDays = 0.00;
                        userObj.leaveWallet = calLeaveWalletBalance(userObj.joinDate);
                    });
                    _.each(response, function(userSheets){
                        var userObj = _.find(vm.users, {_id: userSheets._id});
                        var timeoffHours = 0.00;
                        var timeoffDays = 0.00;
                        _.each(userSheets.timesheets, function(sheetObj){
                            sheetObj.timeoffHours = parseFloat(sheetObj.timeoffHours) 
                            timeoffHours += sheetObj.timeoffHours;
                            sheetObj.timeoffDays = parseFloat((sheetObj.timeoffHours/8)).toFixed(2)
                        });
                        timeoffDays = parseFloat((timeoffHours/8)).toFixed(2);
                        if(userObj){
                            userObj.userResourceType = userSheets.userResourceType;
                            userObj.timeoffHours = parseFloat(timeoffHours);
                            userObj.timeoffDays = parseFloat(timeoffDays);
                            userObj.timesheets = userSheets.timesheets;
                            //console.log(userObj.name); console.log(userObj.timesheets);
                        }
                    });
                }
            }, function(error) {
                console.log(error);
            });
        }

        function calLeaveWalletBalance(joinDate = false){
            var leaveWallet = 0;
            if(joinDate){
                joinDate = new Date(joinDate);
                var financialYearStart = new Date(vm.financialYear.substring(0,4)+"-04-01");
                var financialYearEnd = new Date(vm.financialYear.substring(5)+"-03-31");
                if(financialYearEnd>=joinDate){
                    joinDate = (joinDate>financialYearStart)?joinDate:financialYearStart;
                    var financialMidDate = new Date(vm.financialYear.substring(0,4)+"-09-01");
                    /*if(joinDate==financialYearStart){
                        leaveWallet++;
                    }*/
                    if(joinDate<=financialMidDate){
                        leaveWallet++;
                    }
                    var navDate = joinDate;
                    var diffMonths = 0;
                    while(financialYearEnd>navDate){
                        diffMonths++;
                        navDate.setMonth(navDate.getMonth()+1);
                    }
                    leaveWallet += diffMonths;
                    leaveWallet += 1;
                }
            }
            return leaveWallet;
        }
        
        function getUsers() {
            UserService.GetAll().then(function(response) {
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
