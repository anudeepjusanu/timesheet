﻿(function() {
    'use strict';

    angular
        .module('app', ['ui.router', 'ui.select', 'ngSanitize', 'angular-loading-bar', 'ui.bootstrap', 'ngTable', 'notyModule', 'chart.js', 'angular.chips'])
        .config(config)
        .run(run)
        .constant('_',
            window._
        );

    function config($stateProvider, $urlRouterProvider, ChartJsProvider) {
        // default route
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('layout', {
                url: '',
                abstract: true,
                views: {
                    '': {
                        templateUrl: 'layout/layout.html',
                        controller: 'LayoutController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'login/login.html',
                controller: 'Login.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'login' }
            })
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'home' }
            })
            .state('timesheet', {
                url: '/timesheet',
                templateUrl: 'timesheet/index.html',
                controller: 'Timesheet.IndexController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'timesheet' }
            })
            .state('timesheetApprove', {
                url: '/timesheets',
                templateUrl: 'timesheet/timesheetApprove.html',
                controller: 'Timesheet.ApprovalController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'timesheetApprove' }
            })
            .state('myTimesheets', {
                url: '/myTimesheets',
                templateUrl: 'timesheet/myTimesheets.html',
                controller: 'Timesheet.MyTimesheetsController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'myTimesheets' }
            })
            .state('addTimesheet', {
                url: '/addTimesheet',
                templateUrl: 'timesheet/addTimesheet.html',
                controller: 'Timesheet.TimesheetController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'timesheet' }
            })
            .state('editTimesheet', {
                url: '/editTimesheet/:id',
                templateUrl: 'timesheet/addTimesheet.html',
                controller: 'Timesheet.TimesheetController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'timesheet' }
            })
            .state('consolidatedTimesheet', {
                url: '/consolidatedTimesheet',
                templateUrl: 'timesheet/consolidatedTimesheet.html',
                controller: 'Timesheet.ConsolidatedController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'consolidatedTimesheet' }
            })
            .state('poolUsers', {
                url: '/poolUsers',
                templateUrl: 'home/poolUsers.html',
                controller: 'Home.PoolUsersController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'poolUsers' }
            })
            .state('adminUpdate', {
                url: '/adminUpdate/:id',
                templateUrl: 'home/adminUpdate.html',
                controller: 'Home.AdminController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'home' }
            })
            .state('users', {
                url: '/users',
                templateUrl: 'home/adminUsers.html',
                controller: 'Home.AdminUsersController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'home' }
            })
            .state('allUsers', {
                url: '/allUsers',
                templateUrl: 'home/allUsers.html',
                controller: 'Home.AllUsersController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'home' }
            })
            .state('userInfo', {
                url: '/users/:id',
                templateUrl: 'home/userInfo.html',
                controller: 'Home.UserInfoController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'account' }
            })
            .state('projects', {
                url: '/projects',
                templateUrl: 'projects/index.html',
                controller: 'Projects.IndexController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'projects' }
            })
            .state('addProject', {
                url: '/addProject',
                templateUrl: 'projects/addProject.html',
                controller: 'Projects.AddProjectController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'projects' }
            })
            .state('editProject', {
                url: '/editProject/:id',
                templateUrl: 'projects/addProject.html',
                controller: 'Projects.AddProjectController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'projects' }
            })
            .state('assignUsers', {
                url: '/assignUsers/:id',
                templateUrl: 'projects/assignUsers.html',
                controller: 'Projects.AssignUsersController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'projects' }
            })
            .state('clients', {
                url: '/clients',
                templateUrl: 'projects/clients.html',
                controller: 'Projects.ClientsController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'clients' }
            })
            .state('projectUsers', {
                url: '/projects/projectUsers',
                templateUrl: 'projects/projectUsers.html',
                controller: 'Projects.UsersController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'projectUsers' }
            })
            .state('userProjects', {
                url: '/projects/userProjects',
                templateUrl: 'projects/userProjects.html',
                controller: 'Projects.UserProjectsController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'userProjects' }
            })
            .state('surveys', {
                url: '/surveys',
                templateUrl: 'surveys/index.html',
                controller: 'Surveys.IndexController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'surveys' }
            })
            .state('addSurvey', {
                url: '/surveys/add',
                templateUrl: 'surveys/addSurvey.html',
                controller: 'Surveys.AddSurveyController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'surveys' }
            })
            .state('leaves', {
                url: '/leaves',
                templateUrl: 'leaves/leaves.html',
                controller: 'Leaves.IndexController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'leaves' }
            })
            .state('addLeave', {
                url: '/leaves/add',
                templateUrl: 'leaves/addLeave.html',
                controller: 'Leaves.AddLeaveController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'leaves' }
            })
            .state('team', {
                url: '/myTeam',
                templateUrl: 'team/teams.html',
                controller: 'Team.IndexController',
                controllerAs: 'vm',
                parent: 'layout',
                data: { activeTab: 'team' }
            })
        ChartJsProvider.setOptions({ colors: ['#1caf9a', '#273541'] });
    }

    function run($http, $rootScope, $window, UserService, $timeout, $state) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;
        $rootScope.$on('$stateChangeStart', function(event, next, params) {
            if (!$window.jwtToken) {
                if (next && next.name != 'login') {
                    event.preventDefault();
                    $state.go('login');
                } else {}

            } else {
                if (next && next.name == 'login') {
                    event.preventDefault();
                    $state.go('home');
                } else {}
            }
        });
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
            console.log(token);
            angular.bootstrap(document, ['app']);
        });
    });
})();