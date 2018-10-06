(function() {
    'use strict';

    angular
        .module('app')
        .controller('Login.IndexController', LoginController);

    function LoginController(UserService, $window, $state, $http, $timeout, noty) {
        var vm = this;
        vm.loginObj = {

        };
        vm.login = login;
        var messaging;

        function login() {
            UserService.login(vm.loginObj).then(function(data) {
                if (data && data.token) {
                    $window.jwtToken = data.token;
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;
                    //var messaging = firebase.messaging();
                    // Getting 400 Sometimes
                    $timeout(function() {
                        $state.go('home');
                    });

                }
            }, function(error) {
                console.log(error);
                noty.showError(error)
            });
        }

        function init() {

        };
        //init();
    };

})();