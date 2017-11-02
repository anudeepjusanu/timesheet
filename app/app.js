(function() {
    'use strict';

    angular
        .module('app', ['ui.router', 'ui.select', 'ngSanitize', 'angular-loading-bar', 'ui.bootstrap', 'ngTable', 'notyModule'])
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
                url: '/timesheet',
                templateUrl: 'timesheet/index.html',
                controller: 'Timesheet.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'timesheet' }
            })
            .state('addTimesheet', {
                url: '/addTimesheet',
                templateUrl: 'timesheet/addTimesheet.html',
                controller: 'Timesheet.TimesheetController',
                controllerAs: 'vm',
                data: { activeTab: 'timesheet' }
            })
            .state('editTimesheet', {
                url: '/editTimesheet/:id',
                templateUrl: 'timesheet/addTimesheet.html',
                controller: 'Timesheet.TimesheetController',
                controllerAs: 'vm',
                data: { activeTab: 'timesheet' }
            })
            .state('adminUpdate', {
                url: '/adminUpdate/:id',
                templateUrl: 'home/adminUpdate.html',
                controller: 'Home.AdminController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('users', {
                url: '/users',
                templateUrl: 'home/adminUsers.html',
                controller: 'Home.AdminUsersController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('userInfo', {
                url: '/users/:id',
                templateUrl: 'home/userInfo.html',
                controller: 'Home.UserInfoController',
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

    function run($http, $rootScope, $window, UserService, $timeout) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $timeout(function() {
                $window.dispatchEvent(new Event("resize"));
            }, 100);
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