(function() {
    'use strict';

    angular
        .module('app')
        .controller('Projects.IndexController', Controller)
        .controller('Projects.AddProjectController', AddProjectController)
        .controller('Projects.AssignUsersController', AssignUsersController)
        .controller('Projects.AssignUserModel', AssignUserModel)

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

        vm.delProject = function (projectId) {
            ProjectService.delete(projectId).then(function(response) {
                getProjects();
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
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

    function AddProjectController($state, UserService, ProjectService, $stateParams, $filter, _, FlashService, noty) {
        var vm = this;
        vm.user = {};
        var currentDay = new Date().getDay();
        vm.open2 = function () {
            vm.popup2.opened = true;
        };
        vm.popup2 = {
            opened: false
        };
        vm.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            startingDay: 1
        };
        vm.alerts = [];
        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        };
        vm.obj = {};
        vm.isNew = true;
        
        vm.getProject = function (projectId) {
            ProjectService.getById(projectId).then(function(response) {
                vm.obj = response;
                vm.obj.startDate = new Date(vm.obj.startDate);
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.saveProject = function(form) {
            if (form.$valid) {
                if (vm.isNew) {
                    ProjectService.create(vm.obj).then(function(response) {
                        noty.showSuccess("New Project has been added successfully!");
                        $state.go('projects');
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    ProjectService.update(vm.obj).then(function(response) {
                        noty.showSuccess("Project has been updated successfully!");
                        $state.go('projects');
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }
            } else {
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
            });
            if ($stateParams.id) {
                vm.isNew = false;
                vm.getProject($stateParams.id);
            } else {
                vm.isNew = true;
            }
        }
    }
    
    function AssignUsersController($state, UserService, ProjectService, $stateParams, noty, _, $uibModal) {
        var vm = this;
        vm.project = {};
        vm.users = [];
        vm.assignedUsers = [];

        vm.getProject = function (projectId) {
            ProjectService.getById(projectId).then(function(response) {
                vm.project = response;
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.getAllUsers = function () {
            UserService.GetAll().then(function(response) {
                vm.users = [];
                _.each(response, function (userObj) {
                    vm.users.push({
                        userName: userObj.name,
                        userId: userObj._id
                    });
                });
                if($stateParams.id){
                    vm.getAssignedUsers($stateParams.id);
                }
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }
        
        vm.getAssignedUsers = function (projectId) {
            ProjectService.getAssignedUsers(projectId).then(function(response) {
                vm.assignedUsers = response;
                _.each(vm.assignedUsers, function (assignedUser) {
                    var userIndex = _.findIndex(vm.users, {"userId": assignedUser.userId});
                    if(userIndex >= 0){
                        vm.users.splice(userIndex, 1);
                    }
                });
                console.log(vm.assignedUsers);
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.addColumn = function (user) {

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'projects/assignUserModel.html',
                controller: 'Projects.AssignUserModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function () {
                        return user;
                    },
                    project: function () {
                        return vm.project;
                    }
                }
            });

            modalInstance.result.then(function (userObj) {
                console.log(userObj);
                /*var index = vm.users.indexOf(user);
                vm.assignedUsers.push(user);
                vm.users.splice(index, 1);*/
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }

        vm.deleteColumn = function (user) {
            var index = vm.assignedUsers.indexOf(user);
            vm.users.push(user);
            vm.assignedUsers.splice(index, 1);
        }
        
        vm.saveAssignedUsers = function (form) {
            if (form.$valid) {
                ProjectService.assignUsers(vm.project._id, vm.assignedUsers).then(function(response) {
                    noty.showSuccess("Saved successfully!");
                    $state.go('projects');
                }, function(error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                });
            } else {
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        }

        init();
        function init() {
            if ($stateParams.id) {
                vm.isNew = false;
                vm.getProject($stateParams.id);
            } else {
                vm.isNew = true;
            }
            vm.getAllUsers();
        }
    }

    function AssignUserModel($uibModalInstance, user, project) {
        var vm = this;
        vm.user = user;
        vm.project = project;

        vm.ok = function () {
            $uibModalInstance.close(vm.user);
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

})();