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
        vm.alerts = [];
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
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.addColumn = function (user) {
            user.isNew = true;
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
                    },
                    parentAlerts: function () {
                        return vm.alerts;
                    }
                }
            });
            
            modalInstance.result.then(function (userObj) {
                vm.getAllUsers();
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }

        vm.editAssignUser = function (user) {
            user.isNew = false;
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
                    },
                    parentAlerts: function () {
                        return vm.alerts;
                    }
                }
            });

            modalInstance.result.then(function (userObj) {
                vm.getAllUsers();
            }, function () {
                vm.getAllUsers();
            });
        }

        vm.deleteAssignedUser = function (user) {
            ProjectService.unassignUser(vm.project._id, user.userId).then(function(response) {
                noty.showSuccess("Unassigned successfully!");
                $state.go('projects');
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
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

    function AssignUserModel($uibModalInstance, ProjectService, noty, user, project, parentAlerts) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = parentAlerts;
        vm.resourceTypes = [
            {"resourceTypeId":"shadow", "resourceTypeVal":"Shadow"},
            {"resourceTypeId":"buffer", "resourceTypeVal":"Buffer"},
            {"resourceTypeId":"billable", "resourceTypeVal":"Billable"}
        ];
        if(!vm.alerts){
            vm.alerts = [];
        }
        vm.user = user;
        if(vm.user.startDate){
            vm.user.startDate = new Date(vm.user.startDate);
        }
        if(vm.user.billDates){
            _.each(vm.user.billDates, function (billDate) {
                if(billDate.start){
                    billDate.start = new Date(billDate.start);
                }
                if(billDate.end){
                    billDate.end = new Date(billDate.end);
                }
            });
        }
        vm.project = project;
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

        vm.addBillDate = function () {
            if(!vm.user.billDates){
                vm.user.billDates = [];
            }
            vm.user.billDates.push({"start":"", "end":""});
        }

        vm.deleteBillDate = function (billDate, index) {
            vm.user.billDates.splice(index, 1);
        }

        vm.ok = function (form) {
            if (form.$valid) {
                vm.enableSaveBtn = false;
                var assignedUsers = [];
                assignedUsers.push(vm.user);
                ProjectService.assignUsers(vm.project._id, assignedUsers).then(function(response) {
                    noty.showSuccess("Saved successfully!");
                    vm.enableSaveBtn = true;
                    $uibModalInstance.close(vm.user);
                }, function(error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                    vm.enableSaveBtn = true;
                    $uibModalInstance.close(vm.user);
                });
            } else {
                vm.enableSaveBtn = true;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

})();