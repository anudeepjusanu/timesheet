(function() {
    'use strict';

    angular
        .module('app')
        .controller('Projects.IndexController', Controller)
        .controller('Projects.AddProjectController', AddProjectController)
        .controller('Projects.AssignUsersController', AssignUsersController)
        .controller('Projects.AssignUserModel', AssignUserModel)
        .controller('Projects.ClientModel', ClientModel)
        .controller('Projects.ClientsController', ClientsController)
        .controller('Projects.UsersController', UsersController)

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

    function AddProjectController($state, UserService, ProjectService, $stateParams, $filter, _, FlashService, noty, $uibModal) {
        var vm = this;
        vm.user = {};
        vm.clients = [];
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
        vm.obj = {
            visibility: 'Private'
        };
        vm.isNew = true;
        vm.projectTypes = [
            { projectTypeId: "billed", projectTypeName: "Billed" },
            { projectTypeId: "bizdev", projectTypeName: "Bizdev" },
            { projectTypeId: "ops", projectTypeName: "ops" },
            { projectTypeId: "sales", projectTypeName: "Sales" },
        ];
        
        vm.getClients = function () {
            ProjectService.getClients().then(function(response) {
                vm.clients = response;
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

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
                var clientObj = _.find(vm.clients, {_id: vm.obj.clientId});
                if(clientObj){
                    vm.obj.clientName = clientObj.clientName;
                }
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

        vm.viewClientModel = function (clientObj) {
            var client = {};
            if(clientObj){
                client = clientObj;
                client.isNew = false;
            }else{
                client.isNew = true;
            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'projects/addClientModel.html',
                controller: 'Projects.ClientModel',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    client: function () {
                        return client;
                    }
                }
            });

            modalInstance.result.then(function (clientObj) {
                vm.getClients();
            }, function () {
                vm.getClients();
            });
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
            vm.getClients();
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

    function ClientModel($uibModalInstance, ProjectService, noty, client) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.client = client;

        vm.ok = function (form) {
            if (form.$valid) {
                vm.enableSaveBtn = false;
                if(vm.client.isNew === true){
                    ProjectService.createClient(vm.client).then(function(response) {
                        noty.showSuccess("New Client has been created successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.client);
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.client);
                    });
                }else{
                    ProjectService.updateClient(vm.client).then(function(response) {
                        noty.showSuccess("Client has been updated successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.client);
                    }, function(error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.client);
                    });
                }
            } else {
                vm.enableSaveBtn = true;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
    
    function ClientsController(UserService, ProjectService, $uibModal, _) {
        var vm = this;
        vm.user = {};
        vm.clients = [];

        function getClients(){
            ProjectService.getClients().then(function(response) {
                vm.clients = response;
            }, function(error){
                console.log(error);
            });
        }

        vm.delClient = function (clientId) {
            ProjectService.deleteClient(clientId).then(function(response) {
                getClients();
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.viewClientModel = function (clientObj) {
            var client = {};
            if(clientObj){
                client = clientObj;
                client.isNew = false;
            }else{
                client.isNew = true;
            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'projects/addClientModel.html',
                controller: 'Projects.ClientModel',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    client: function () {
                        return client;
                    }
                }
            });

            modalInstance.result.then(function (clientObj) {
                getClients();
            }, function () {
                getClients();
            });
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin !== true) {

                }
            });
            getClients();
        }
    };

    function UsersController(UserService, ProjectService, _) {
        var vm = this;
        vm.user = {};
        vm.projects = [];

        function getProjectUsers(){
            ProjectService.getProjectUsers().then(function(response) {
                console.log(response);
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
            getProjectUsers();
        }
    };

})();