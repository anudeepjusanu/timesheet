(function() {
    'use strict';

    angular
        .module('app')
        .controller('Projects.IndexController', Controller)
        .controller('Projects.AddProjectController', AddProjectController)

    function Controller(UserService, ProjectService, $filter, _, FlashService, NgTableParams, noty) {
        var vm = this;
        vm.user = {};
        vm.projects = [];

        function getProjects(){
            ProjectService.getAll().then(function(response) {
                vm.projects = response;
            }, function(error){
                console.log(error);
            });
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin !== true) {

                }
            });
            getProjects();
        }
    }

    function Controller(UserService, ProjectService, $filter, _, FlashService, NgTableParams, noty) {
        var vm = this;
        vm.user = {};
        vm.projects = [];

        function getProjects(){
            ProjectService.getAll().then(function(response) {
                vm.projects = response;
            }, function(error){
                console.log(error);
            });
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin !== true) {

                }
            });
            getProjects();
        }
    }

})();