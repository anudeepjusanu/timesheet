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
                vm.myleaves = myleaves;
                _.each(vm.myleaves, function(leaveObj){
                    leaveObj.takenLeaves = 0.00;
                    leaveObj.monthBalance = 0.00;
                    if(leaveObj) {
                        vm.myleaves.accruedLeaves = leaveObj.accruedLeaves;
                        vm.myleaves.creditedLeaves = leaveObj.creditedLeaves;
                        vm.myleaves.deductedLOP = leaveObj.deductedLOP; 
                    }
                    vm.myleaves.accruedLeaves += leaveObj.accruedLeaves;
                    vm.totalLeaveBalance = leaveObj.accruedLeaves + leaveObj.creditedLeaves - leaveObj.deductedLOP;
                });
                TimesheetService.userTakenLeaves(vm.user._id).then(function(leavesData) {
                    if(leavesData){
                        _.each(leavesData, function(leaveObj){
                            var leaveWeek = new Date(leaveObj.weekDate);
                            var monthNum  = leaveWeek.getMonth()+1;
                            var yearMonth = String(leaveWeek.getFullYear()+"-"+(monthNum>9?monthNum:"0"+monthNum));
                            var myLeaveObj = _.find(vm.myleaves, {yearMonth: yearMonth});
                            if(myLeaveObj){
                                var timeoffHours = parseFloat(leaveObj.timeoffHours/8);
                                myLeaveObj.takenLeaves += timeoffHours;
                                //myLeaveObj.takenLeaves = parseFloat(myLeaveObj.takenLeaves).toFixed(2);
                                myLeaveObj.monthBalance = parseFloat(myLeaveObj.accruedLeaves + myLeaveObj.creditedLeaves - myLeaveObj.takenLeaves - myLeaveObj.deductedLOP).toFixed(2);
                                vm.totalLeaveBalance = myLeaveObj.monthBalance;
                            }
                        });
                    }
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