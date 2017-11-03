(function() {
    'use strict';

    angular
        .module('app')
        .controller('Projects.IndexController', Controller)
        .controller('Projects.TimesheetController', TimesheetController)

    function Controller(UserService, $filter, ReportService, _, $scope, FlashService, NgTableParams, noty) {
        var vm = this;
        vm.user = null;
        vm.post = post;
        vm.remind = remind;


        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin) {

                } else {

                }
            });
        }
    }



})();