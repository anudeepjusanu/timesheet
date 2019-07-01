(function() {
    'use strict';

    angular
        .module('app')
        .controller('Team.IndexController', TeamsController)
        .controller('Team.LeaveBalanceController', LeaveBalanceController)
        .controller('Team.UserLeavesModel',UserLeavesModel)
        .controller('Team.UserLOPLeavesModel',UserLOPLeavesModel)
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

    function UserLeavesModel($uibModalInstance, UserService, user, ProjectService, noty) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.user = user;

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

        vm.yearMonthSelected = false;     
        // debugger;  
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
        vm.monthOptions = {
            datepickerMode: "month", // Remove Single quotes
            minMode: 'month'
        };
        vm.format = 'yyyy-MM';

        vm.ok = function(form) {
            if (form.$valid) {
                vm.enableSaveBtn = false;
                if (vm.user) {

                    if(vm.user.yearMonth) {
                        // debugger;
                        var monthNum  = vm.user.yearMonth.getMonth()+1;
                        var yearMonth = String(vm.user.yearMonth.getFullYear()+"-"+(monthNum>9?monthNum:"0"+monthNum));
                        vm.user.yearMonth = yearMonth;
                    }

                    var obj = {
                        "name": vm.user.name,
                        "creditedLeaves": vm.user.creditedLeaves,
                        "creditedLeavesComment": vm.user.creditedLeavesComment,
                        "yearMonth": vm.user.yearMonth
                    }

                    UserService.updateUserLeaveBalance(vm.user._id, obj).then(function(response) {
                        debugger;
                        if(response) {                        
                        noty.showSuccess("New Leave has been added successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(obj);
                    }
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(obj);
                    });
                } 
            } else {
                vm.enableSaveBtn = false;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        };

        vm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    };

    function UserLOPLeavesModel($uibModalInstance, UserService, user, ProjectService, noty) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.user = user;

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

        vm.yearMonthSelected = false;     
        // debugger;  
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
        vm.monthOptions = {
            datepickerMode: "month",
            minMode: 'month'
        };
        vm.format = 'yyyy-MM';

        vm.ok = function(form) {
            if (form.$valid) {
                vm.enableSaveBtn = false;
                if (vm.user) {

                    if(vm.user.yearMonth) {
                        var monthNum  = vm.user.yearMonth.getMonth()+1;
                        var yearMonth = String(vm.user.yearMonth.getFullYear()+"-"+(monthNum>9?monthNum:"0"+monthNum));
                        vm.user.yearMonth = yearMonth;
                    }

                    var obj = {
                        "name": vm.user.name,
                        "deductedLOP": vm.user.deductedLOP,
                        "deductedLOPComment": vm.user.deductedLOPComment,
                        "yearMonth": vm.user.yearMonth
                    }

                    UserService.updateUserLeaveBalance(vm.user._id, obj).then(function(response) {
                        // debugger;
                        if(response) {                        
                        noty.showSuccess("Deducted LOP has been added successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(obj);
                    }
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(obj);
                    });
                } 
            } else {
                vm.enableSaveBtn = false;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        };

        vm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    };

    function LeaveBalanceController(UserService, TimesheetService, ProjectService, AppConfigService, $scope, $filter, $uibModal, noty) {
        var vm = this;
        vm.timesheets = {};
        vm.appSettings = [];
        vm.users = [];
        vm.search = {
            userName: "",
            yearMonth: "",
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
            "phone": {label: "Mobile", selected: false},
            "joinDate": {label: "Join Date", selected: true},
            "employeeCategory": {label: "Category", selected: false},
            "employeeType": {label: "Employee Type", selected: false},
            "totalAccruedLeaves": {label: "Accrued Leaves", selected: true},
            "totalCreditedLeaves": {label: "Credited Leaves", selected: true},
            //"timeoffHours": {label: "Timeoff Hours", selected: true},
            "timeoffDays": {label: "Timeoff Days", selected: true},
            "totalDeductedLOP": {label: "LOP Days", selected: true},
            "totalBalance": {label: "Balance", selected: true},
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

        vm.exportTable = function() {
            $scope.$broadcast('export-excl', { "date": vm.filterDate });
        }

        vm.getUserLeaves = function(){
            TimesheetService.usersLeaveBalance(vm.financialYear).then(function(response) {
                _.each(vm.users, function(userObj){
                    userObj.totalTimeoffHours = 0;
                    userObj.timeoffDays = 0.00;
                    userObj.totalAccruedLeaves = 0;
                    userObj.totalCreditedLeaves = 0;
                    userObj.totalDeductedLOP = 0;
                    userObj.totalBalance = 0;
                });
                if(response){ 
                    _.each(response, function(userSheet){
                        var userObj = _.find(vm.users, {_id: userSheet.userId});
                        if(userObj){
                            userObj.totalAccruedLeaves = userSheet.totalAccruedLeaves;
                            userObj.totalCreditedLeaves = userSheet.totalCreditedLeaves;
                            userObj.totalDeductedLOP = userSheet.totalDeductedLOP;
                            userObj.totalTimeOffHours = userSheet.totalTimeOffHours;
                            userObj.timeoffDays = parseFloat((userObj.totalTimeOffHours/8)).toFixed(2);
                            userObj.timeoffDays = parseFloat(userObj.timeoffDays);
                            userObj.totalBalance = parseFloat(userObj.totalAccruedLeaves + userObj.totalCreditedLeaves + userObj.totalDeductedLOP - userObj.timeoffDays).toFixed(2);
                        }
                    });
                }
            }, function(error) {
                console.log(error);
            });
        }        

        /*function calLeaveWalletBalance(joinDate = false){
            var leaveWallet = parseFloat(0);
            const acquire_leaves_month = parseFloat((vm.appSettings['acquire_leaves_month'])?vm.appSettings['acquire_leaves_month']:1.25);
            if(joinDate){
                joinDate = new Date(joinDate);
                var financialYearStart = new Date(vm.financialYear.substring(0,4)+"-04-01");
                var financialYearEnd = new Date(vm.financialYear.substring(5)+"-03-31");
                var nowDate = new Date();

                var monthNum  = nowDate.getMonth()+1;
                var yearMonth = String(nowDate.getFullYear()+"-"+(monthNum>9?monthNum:"0"+monthNum));
                vm.currentYearMonth = yearMonth;

                if(financialYearEnd>=joinDate){
                    joinDate = (joinDate>financialYearStart)?joinDate:financialYearStart;
                    var navDate = joinDate;
                    while(financialYearEnd>navDate && nowDate>navDate){
                        leaveWallet = parseFloat(parseFloat(leaveWallet) + parseFloat(acquire_leaves_month)).toFixed(10);
                        navDate.setMonth(navDate.getMonth()+1);
                    }
                }
            }
            return parseFloat(leaveWallet).toFixed(2);
        }*/
        
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

        function getAppSettings() {
            AppConfigService.getAppSettings().then(function(data){
                if(data.length>0){
                    _.each(data, function(item){
                        vm.appSettings[item.keyName] = item.keyVal;
                    });
                }
            }, function(errors){
                console.log(errors);
            });
        }

        function init() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                getUsers();
                getAppSettings();
                getClients();
            });
        }
        init();

        function getClients() {
            ProjectService.getClients().then(function(response) {
                vm.clients = response;
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.viewLeaveModel = function(userObj) {
            var user = {};

            if (userObj) {
                user = userObj;
                user.isCreditedLeave = true;
            }

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'team/addLeavesModel.html',
                controller: 'Team.UserLeavesModel',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    user: function() {
                        return user;
                    }
                }
            });

            modalInstance.result.then(function(user) {
                vm.getUserLeaves();
            }, function() {
                vm.getUserLeaves();
            });
        }

        vm.viewLOPLeaveModel = function(userObj) {
            var user = {};

            if (userObj) {
                user = userObj;
                user.isLOPLeave = true;
            }

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'team/addLOPLeavesModel.html',
                controller: 'Team.UserLOPLeavesModel',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    user: function() {
                        return user;
                    }
                }
            });

            modalInstance.result.then(function(user) {
                vm.getUserLeaves();
            }, function() {
                vm.getUserLeaves();
            });
        }
    };

})();
