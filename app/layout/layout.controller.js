(function () {
    'use strict';

    angular
        .module('app')
        .controller('LayoutController', LayoutController);

    function LayoutController($window, $state, UserService) {
        var vm = this;
        vm.logout = logout;
        vm.sidebarStatus = 'close';

        vm.xNavigationMinimize = function() {

            if (vm.sidebarStatus == 'open') {
                $(".page-container").removeClass("page-container-wide");
                $(".page-sidebar .x-navigation").removeClass("x-navigation-minimized");
                $(".x-navigation-minimize").find(".fa").removeClass("fa-indent").addClass("fa-dedent");
                $(".page-sidebar.scroll").mCustomScrollbar("update");
                vm.sidebarStatus = 'close';
            } else if (vm.sidebarStatus == 'close') {
                $(".page-container").addClass("page-container-wide");
                $(".page-sidebar .x-navigation").addClass("x-navigation-minimized");
                $(".x-navigation-minimize").find(".fa").removeClass("fa-dedent").addClass("fa-indent");
                $(".page-sidebar.scroll").mCustomScrollbar("disable", true);
                vm.sidebarStatus = 'open';
            }

            $(".x-navigation li.active").removeClass("active");

        }

        function logout() {
            UserService.logout().then(function () {
                $window.jwtToken = null;
                $state.go('login');
            }, function (error) {
                console.log("Error loggin out");
            });
        }

        function init() {

        };
        init();
    };

})();