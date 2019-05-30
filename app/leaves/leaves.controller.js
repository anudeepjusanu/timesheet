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

        function getMyLeaves(){

            TimesheetService.userTakenLeaves(vm.user._id).then(function(response) {
                console.log("userTakenLeaves : " + response);
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