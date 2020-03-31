(function() {
    'use strict';

    angular
        .module('app')
        .controller('Leaves.IndexController', LeavesController)
        .controller('Leaves.AddLeaveController', AddLeaveController)
        .controller('Leaves.ViewLeaveController', ViewLeaveController);

    function LeavesController(UserService, _, SurveyService) {
        var vm = this;

        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin !== true) {

                }
            });
        }
        initController();
    };

    function AddLeaveController(UserService, _, SurveyService) {
        var vm = this;

        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin !== true) {

                }
            });
        };
        initController();
    };

    function ViewLeaveController(UserService, _, TimesheetService) {
        var vm = this;
        vm.user = {};
        vm.myleaves = [];
        vm.totalLeaveBalance = 0;

        function getMyLeaves(){
            UserService.getMyLeaveWallet().then(function(myleaves) {
                vm.totalLeaveBalance = 0.00;
                vm.myleaves = myleaves;
                _.each(vm.myleaves, function(leaveObj){
                    leaveObj.takenLeaves = 0.00;
                    leaveObj.timeoffLeaves = 0.00;
                    leaveObj.sickLeaves = 0.00;
                    leaveObj.monthBalance = 0.00;
                    if(leaveObj) {
                        vm.myleaves.accruedLeaves = leaveObj.accruedLeaves;
                        vm.myleaves.creditedLeaves = leaveObj.creditedLeaves;
                        vm.myleaves.deductedLOP = leaveObj.deductedLOP; 
                    }
                    vm.myleaves.accruedLeaves += leaveObj.accruedLeaves;
                    vm.totalLeaveBalance += leaveObj.accruedLeaves + leaveObj.creditedLeaves + leaveObj.deductedLOP;
                });
                TimesheetService.userTakenLeaves(vm.user._id).then(function(leavesData) {
                    if(leavesData){
                        _.each(leavesData, function(leaveObj){
                            var leaveWeek = new Date(leaveObj.weekDate);
                            var monthNum  = leaveWeek.getMonth()+1;
                            var yearMonth = String(leaveWeek.getFullYear()+"-"+(monthNum>9?monthNum:"0"+monthNum));
                            var myLeaveObj = _.find(vm.myleaves, {yearMonth: yearMonth});
                            if(myLeaveObj){
                                myLeaveObj.takenLeaves += parseFloat(leaveObj.totalTimeoffHours/8);
                                myLeaveObj.timeoffLeaves += parseFloat(leaveObj.timeoffHours/8);
                                myLeaveObj.sickLeaves += parseFloat(leaveObj.sickLeaveHours/8);
                                myLeaveObj.monthBalance = parseFloat(myLeaveObj.accruedLeaves + myLeaveObj.creditedLeaves - myLeaveObj.takenLeaves - myLeaveObj.deductedLOP).toFixed(2);
                            }
                        });
                    }
                    _.each(vm.myleaves, function(leaveObj){
			            vm.totalLeaveBalance = vm.totalLeaveBalance - (leaveObj.timeoffLeaves + leaveObj.sickLeaves);
                        leaveObj.timeoffLeaves = parseFloat(leaveObj.timeoffLeaves).toFixed(2);
                        leaveObj.sickLeaves = parseFloat(leaveObj.sickLeaves).toFixed(2);
                    });
		            vm.totalLeaveBalance = parseFloat(vm.totalLeaveBalance).toFixed(2);
                });
            });
            
        }

        function initController() {
            
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin !== true) {

                }
                getMyLeaves();
            });
        };
        initController();
    };
})();
