(function() {
    'use strict';

    angular
        .module('app', ['ui.router', 'ui.select', 'ngSanitize', 'angular-loading-bar', 'ui.bootstrap', 'ngTable'])
        .config(config)
        .run(run)
        .constant('_',
            window._
        );

    function config($stateProvider, $urlRouterProvider) {
        // default route
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('timesheet', {
                url: '/addTimesheet',
                templateUrl: 'home/timesheet.html',
                controller: 'Home.TimesheetController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('editTimesheet', {
                url: '/editTimesheet/:id',
                templateUrl: 'home/timesheet.html',
                controller: 'Home.TimesheetController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('adminUpdate', {
                url: '/adminUpdate/:id',
                templateUrl: 'home/adminUpdate.html',
                controller: 'Home.AdminController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('adminUsers', {
                url: '/adminUsers',
                templateUrl: 'home/adminUsers.html',
                controller: 'Home.AdminUsersController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            });
    }

    function run($http, $rootScope, $window, UserService) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;

        });
    }

    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function() {
        // get JWT token from server
        $.get('/app/token', function(token) {
            window.jwtToken = token;

            angular.bootstrap(document, ['app']);
        });
    });
})();