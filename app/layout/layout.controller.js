(function () {
    'use strict';

    angular
        .module('app')
        .controller('LayoutController', LayoutController);

    function LayoutController($window, $state, UserService) {
        var vm = this;
        vm.logout = logout;

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