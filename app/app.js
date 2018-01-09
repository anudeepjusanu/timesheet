(function() {
    'use strict';

    angular
        .module('app', ['ui.router', 'ui.select', 'ngSanitize', 'angular-loading-bar', 'ui.bootstrap', 'ngTable', 'notyModule', 'chart.js'])
        .config(config)
        .run(run)
        .constant('_',
            window._
        );

    function config($stateProvider, $urlRouterProvider, ChartJsProvider) {
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
            .state('consolidatedTimesheet', {
                url: '/consolidatedTimesheet',
                templateUrl: 'timesheet/consolidatedTimesheet.html',
                controller: 'Timesheet.ConsolidatedController',
                controllerAs: 'vm',
                data: { activeTab: 'consolidatedTimesheet' }
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
            .state('allUsers', {
                url: '/allUsers',
                templateUrl: 'home/allUsers.html',
                controller: 'Home.AllUsersController',
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
            })
            .state('projects', {
                url: '/projects',
                templateUrl: 'projects/index.html',
                controller: 'Projects.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'projects' }
            })
            .state('addProject', {
                url: '/addProject',
                templateUrl: 'projects/addProject.html',
                controller: 'Projects.AddProjectController',
                controllerAs: 'vm',
                data: { activeTab: 'projects' }
            })
            .state('editProject', {
                url: '/editProject/:id',
                templateUrl: 'projects/addProject.html',
                controller: 'Projects.AddProjectController',
                controllerAs: 'vm',
                data: { activeTab: 'projects' }
            })
            .state('assignUsers', {
                url: '/assignUsers/:id',
                templateUrl: 'projects/assignUsers.html',
                controller: 'Projects.AssignUsersController',
                controllerAs: 'vm',
                data: { activeTab: 'projects' }
            })
            .state('clients', {
                url: '/clients',
                templateUrl: 'projects/clients.html',
                controller: 'Projects.ClientsController',
                controllerAs: 'vm',
                data: { activeTab: 'clients' }
            })
            .state('projectUsers', {
                url: '/projects/projectUsers',
                templateUrl: 'projects/projectUsers.html',
                controller: 'Projects.UsersController',
                controllerAs: 'vm',
                data: { activeTab: 'projectUsers' }
            })
            .state('userProjects', {
                    url: '/projects/userProjects',
                    templateUrl: 'projects/userProjects.html',
                    controller: 'Projects.UserProjectsController',
                    controllerAs: 'vm',
                    data: { activeTab: 'userProjects' }
                });
            ChartJsProvider.setOptions({ colors : [ '#1caf9a', '#273541'] });
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