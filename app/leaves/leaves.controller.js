(function() {
    'use strict';

    angular
        .module('app')
        .controller('Leaves.IndexController', LeavesController)
        .controller('Leaves.AddLeaveController', AddLeaveController);

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
})();