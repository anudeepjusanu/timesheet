(function() {
    'use strict';

    angular
        .module('app')
        .controller('Projects.IndexController', Controller)
        .controller('Projects.AddProjectController', AddProjectController)
        .controller('Projects.ViewProjectModel', ViewProjectModel)
        .controller('Projects.AssignUsersController', AssignUsersController)
        .controller('Projects.AssignUserModel', AssignUserModel)
        .controller('Projects.ClientModel', ClientModel)
        .controller('Projects.ClientsController', ClientsController)
        .controller('Projects.UsersController', UsersController)
        .controller('Projects.UserProjectsController', UserProjectsController)
        .controller('Projects.projectHierarchyController', projectHierarchyController)
        .filter('searchProjectUser', searchProjectUser)
        .filter('searchUserProject', searchUserProject)
        .filter('searchProject', searchProject)
   
    function Controller(UserService, ProjectService, $filter, _, FlashService, NgTableParams, $uibModal, noty) {
        var vm = this;
        vm.user = {};
        vm.clients = [];
        vm.projects = [];
        vm.projectTypes = [
            { projectTypeId: "", projectTypeName: "All" },
            { projectTypeId: "billed", projectTypeName: "Billed" },
            { projectTypeId: "bizdev", projectTypeName: "Bizdev" },
            { projectTypeId: "ops", projectTypeName: "ops" },
            { projectTypeId: "sales", projectTypeName: "Sales" }
        ];
        vm.projectBillTypes = [
            { projectBillId: "", projectBillName: "All" },
            { projectBillId: "fixed-bid", projectBillName: "Fixed bid" },
            { projectBillId: "time-material", projectBillName: "Time and material" }
        ];
        vm.projectBusinessUnits = ["All", "Launchpad", "Enterprise", "Operations", "Sales&Marketing", "SAS Products", "R&D", "iCancode-Training", "WL-Training", "Skill Up"];

        function getProjects() {
            ProjectService.getAll().then(function(response) {
                vm.projects = response;
            }, function(error) {
                console.log(error);
            });
        }
        vm.search = {
            clientId: "",
            projectName: "",
            projectBillType: "",
            projectType: "",
            businessUnit: "All",
            isActive: true
        };

        function getClients() {
            ProjectService.getClients().then(function(response) {
                vm.clients = response;
                vm.clients.unshift({ _id: "", "clientName": "All" });
            }, function(error) {
                console.log(error);
            });
        }

        vm.viewProject = function(projectObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'projects/viewProjectModel.html',
                controller: 'Projects.ViewProjectModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    projectObj: function() {
                        return projectObj;
                    }
                }
            });
            modalInstance.result.then(function(projectObj) {

            }, function() {

            });
        }

        vm.delProject = function(projectId) {
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
            getClients();
            getProjects();
        }
    }

    function searchProject($filter) {
        return function(input, searchObj) {
            var output = input;
            if (searchObj.clientId && searchObj.clientId.length > 0) {
                output = $filter('filter')(output, { clientId: searchObj.clientId });
            }
            if (searchObj.projectName && searchObj.projectName.length > 0) {
                output = $filter('filter')(output, { projectName: searchObj.projectName });
            }
            if (searchObj.projectBillType && searchObj.projectBillType.length > 0) {
                output = $filter('filter')(output, { projectBillType: searchObj.projectBillType });
            }
            if (searchObj.projectType && searchObj.projectType.length > 0) {
                output = $filter('filter')(output, { projectType: searchObj.projectType });
            }
            if (searchObj.businessUnit && searchObj.businessUnit.length > 0 && searchObj.businessUnit != "All") {
                output = $filter('filter')(output, { businessUnit: searchObj.businessUnit });
            }
            if (searchObj.ownerName && searchObj.ownerName.length > 0) {
                output = $filter('filter')(output, { ownerName: searchObj.ownerName });
            }
            if (searchObj.isActive === true || searchObj.isActive === false) {
                output = $filter('filter')(output, { isActive: searchObj.isActive });
            }
            return output;
        }
    }

    function AddProjectController($state, UserService, ProjectService, $stateParams, $filter, _, FlashService, noty, $uibModal) {
        var vm = this;
        vm.user = {};
        vm.clients = [];
        var currentDay = new Date().getDay();
        vm.open2 = function() {
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
        vm.closeAlert = function(index) {
            vm.alerts.splice(index, 1);
        };
        vm.obj = {
            visibility: 'Private',
            isActive: true
        };
        vm.isNew = true;
        vm.projectTypes = [
            { projectTypeId: "billed", projectTypeName: "Billed" },
            { projectTypeId: "bizdev", projectTypeName: "Bizdev" },
            { projectTypeId: "ops", projectTypeName: "ops" },
            { projectTypeId: "sales", projectTypeName: "Sales" }
        ];
        vm.projectBillTypes = [
            { projectBillId: "fixed-bid", projectBillName: "Fixed bid" },
            { projectBillId: "time-material", projectBillName: "Time and material" }
        ];
        vm.projectBillTypes = [
            { projectBillId: "fixed-bid", projectBillName: "Fixed bid" },
            { projectBillId: "time-material", projectBillName: "Time and material" }
        ];
        vm.projectBusinessUnits = ["Launchpad", "Enterprise", "Operations", "Sales&Marketing", "SAS Products", "R&D", "iCancode-Training", "WL-Training", "Skill Up"];

        vm.getClients = function() {
            ProjectService.getClients().then(function(response) {
                vm.clients = response;
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        function getAllUsers() {
            UserService.GetAll().then(function(users) {
                vm.users = users;
                vm.users = _.sortBy(vm.users, 'name');
                if (!vm.isNew) {
                    _.each(users, function(user) {
                        if (user._id == vm.obj.ownerId) {
                            vm.obj.user = user;
                        };
                    });
                }
            });
        };

        vm.getProject = function(projectId) {
            ProjectService.getById(projectId).then(function(response) {
                vm.obj = response;
                vm.obj.startDate = new Date(vm.obj.startDate);
                getAllUsers();
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.saveProject = function(form) {
            if (form.$valid) {
                var clientObj = _.find(vm.clients, { _id: vm.obj.clientId });
                if (clientObj) {
                    vm.obj.clientName = clientObj.clientName;
                }
                vm.obj.ownerId = vm.obj.user._id;
                vm.obj.ownerName = vm.obj.user.name;
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

        vm.viewClientModel = function(clientObj) {
            var client = {};
            if (clientObj) {
                client = clientObj;
                client.isNew = false;
            } else {
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
                    client: function() {
                        return client;
                    }
                }
            });

            modalInstance.result.then(function(clientObj) {
                vm.getClients();
            }, function() {
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
                getAllUsers();
            }
            vm.getClients();

        }
    }

    function ViewProjectModel($uibModalInstance, ProjectService, noty, projectObj) {
        var vm = this;
        vm.alerts = [];
        vm.projectObj = projectObj;
        vm.assignedUsers = [];

        function getProjectAssignedUsers(projectId) {
            ProjectService.getAssignedUsers(projectId).then(function(response) {
                vm.assignedUsers = response;
            }, function(error) {
                console.log(error);
            });
        }
        getProjectAssignedUsers(vm.projectObj._id);
        vm.closeBox = function() {
            $uibModalInstance.dismiss('cancel');
        };
    };

    function AssignUsersController($state, UserService, ProjectService, $stateParams, noty, _, $uibModal) {
        var vm = this;
        vm.alerts = [];
        vm.project = {};
        vm.users = [];
        vm.assignedUsers = [];

        vm.getProject = function(projectId) {
            ProjectService.getById(projectId).then(function(response) {
                vm.project = response;
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.getUsers = function() {
            UserService.getUsers().then(function(response) {
                vm.users = [];
                _.each(response, function(userObj) {
                    vm.users.push({
                        userName: userObj.name,
                        userId: userObj._id
                    });
                });
                if ($stateParams.id) {
                    vm.getAssignedUsers($stateParams.id);
                }
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.getAssignedUsers = function(projectId) {
            ProjectService.getAssignedUsers(projectId).then(function(response) {
                vm.assignedUsers = response;
                _.each(vm.assignedUsers, function(assignedUser) {
                    var userIndex = _.findIndex(vm.users, { "userId": assignedUser.userId });
                    if (userIndex >= 0) {
                        vm.users.splice(userIndex, 1);
                    }
                });
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.addColumn = function(user) {
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
                    user: function() {
                        return user;
                    },
                    project: function() {
                        return vm.project;
                    },
                    parentAlerts: function() {
                        return vm.alerts;
                    }
                }
            });

            modalInstance.result.then(function(userObj) {
                vm.getAllUsers();
            }, function() {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }

        vm.editAssignUser = function(user) {
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
                    user: function() {
                        return user;
                    },
                    project: function() {
                        return vm.project;
                    },
                    parentAlerts: function() {
                        return vm.alerts;
                    }
                }
            });

            modalInstance.result.then(function(userObj) {
                vm.getAllUsers();
            }, function() {
                vm.getAllUsers();
            });
        }

        vm.deleteAssignedUser = function(user) {
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
            vm.getUsers();
        }
    }

    function AssignUserModel($uibModalInstance, ProjectService, UserService, noty, user, project) {
        var vm = this;
        vm.alerts = [];
        vm.enableSaveBtn = true;
        vm.resourceTypes = [
            { "resourceTypeId": "shadow", "resourceTypeVal": "Shadow" },
            { "resourceTypeId": "buffer", "resourceTypeVal": "Buffer" },
            { "resourceTypeId": "billable", "resourceTypeVal": "Billable" },
            { "resourceTypeId": "bizdev", "resourceTypeVal": "Bizdev" },
            { "resourceTypeId": "projectDelivery", "resourceTypeVal": "Project Delivery" },
            { "resourceTypeId": "internal", "resourceTypeVal": "Internal" },
            { "resourceTypeId": "operations", "resourceTypeVal": "Operations" },
            { "resourceTypeId": "trainee", "resourceTypeVal": "Trainee" },
            { "resourceTypeId": "intern", "resourceTypeVal": "Intern" },
            { "resourceTypeId": "bench", "resourceTypeVal": "Bench" }
        ];

        vm.users = [];
        vm.projects = [];
        vm.user = user;
        vm.user.chooseUser = false;
        if (!user.userId) {
            getUsers();
            vm.user.chooseUser = true;
        }
        if (vm.user.billDates) {
            _.each(vm.user.billDates, function(billDate) {
                if (billDate.start) {
                    billDate.start = new Date(billDate.start);
                }
                if (billDate.end) {
                    billDate.end = new Date(billDate.end);
                }
            });
        }
        vm.project = project;
        vm.project.chooseProject = false;
        if (!vm.project._id) {
            getProjects();
            vm.project.chooseProject = true;
        }
        var currentDay = new Date().getDay();
        vm.open2 = function() {
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

        vm.addBillDate = function() {
            if (!vm.user.billDates) {
                vm.user.billDates = [];
            }
            vm.user.billDates.push({ "start": "", "end": "" });
        }

        vm.deleteBillDate = function(billDate, index) {
            vm.user.billDates.splice(index, 1);
        }

        vm.ok = function(form) {
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

        vm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        function getUsers() {
            UserService.getUsers().then(function(response) {
                vm.users = [];
                _.each(response, function(userObj) {
                    vm.users.push({
                        userName: userObj.name,
                        userId: userObj._id
                    });
                });
                vm.users = _.sortBy(vm.users, 'userName');
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        function getProjects() {
            ProjectService.getAll().then(function(response) {
                vm.projects = response;
                if (vm.user.projects && vm.user.projects.length > 0) {
                    _.each(vm.user.projects, function(projectObj) {                        
                        var prjIndex = _.findIndex(vm.projects, { _id: projectObj.projectId });
                        if (prjIndex >= 0) {
                            vm.projects.splice(prjIndex, 1);
                        }
                    });
                }
            }, function(error) {
                console.log(error);
            });
        }
    };

    function ClientModel($uibModalInstance, ProjectService, noty, client) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.client = client;

        vm.ok = function(form) {
            if (form.$valid) {
                vm.enableSaveBtn = false;
                if (vm.client.isNew === true) {
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
                } else {
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

        vm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    };

    function ClientsController(UserService, ProjectService, $uibModal, _) {
        var vm = this;
        vm.user = {};
        vm.clients = [];

        function getClients() {
            ProjectService.getClients().then(function(response) {
                vm.clients = response;
            }, function(error) {
                console.log(error);
            });
        }

        vm.delClient = function(clientId) {
            ProjectService.deleteClient(clientId).then(function(response) {
                getClients();
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.viewClientModel = function(clientObj) {
            var client = {};
            if (clientObj) {
                client = clientObj;
                client.isNew = false;
            } else {
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
                    client: function() {
                        return client;
                    }
                }
            });

            modalInstance.result.then(function(clientObj) {
                getClients();
            }, function() {
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

    function UsersController(UserService, ProjectService, _, $uibModal) {
        var vm = this;
        vm.user = {};
        vm.projects = [];
        vm.projectTypes = [
            { projectTypeId: "all", projectTypeName: "All" },
            { projectTypeId: "billed", projectTypeName: "Billed" },
            { projectTypeId: "bizdev", projectTypeName: "Bizdev" },
            { projectTypeId: "ops", projectTypeName: "ops" },
            { projectTypeId: "sales", projectTypeName: "Sales" }
        ];
        vm.projectBusinessUnits = ["All", "Launchpad", "Enterprise", "Operations", "Sales&Marketing", "SAS Products", "R&D", "iCancode-Training", "WL-Training", "Skill Up"];
        vm.search = {
            projectName: "",
            projectStatus: "Active",
            projectType: "all",
            businessUnit: "All"
        };

        vm.userColumns = {
            "projectName": {label: "Project Name", selected: true},
            "businessUnit": {label: "Business Unit", selected: true},
            "projectType": {label: "Project Type", selected: true},
            "ownerName": {label: "Owner Name", selected: true},
            "userName": {label: "User Name", selected: true},
            "start": {label: "Start Date", selected: true},
            "end": {label: "End Date", selected: true},
            "allocatedHours": {label: "Allocated Hours", selected: true},
            "billableLimit": {label: "Billable Limit", selected: true},
            "userResourceType": {label: "Resource Type", selected: true},
            "isActive": {label: "Status", selected: true},
        };
        vm.sorting = function(orderBy) {
            if (vm.search.orderBy == orderBy) {
                vm.search.sortDESC = !vm.search.sortDESC;
            } else {
                vm.search.sortDESC = false;
            }
            vm.search.orderBy = orderBy;
        };

        vm.activeProjectsfilterFn = function(item) {
            var activeProjectsArr = [];
            if(item) {
                _.each(item.users, function(billDatesArr) {
                    _.each(billDatesArr.billDates, function(billDatesObj){
                        var currentDate = new Date();
                        if(!billDatesObj.end || (billDatesObj.end > currentDate)) {
                            activeProjectsArr.push(billDatesObj.end);    
                        }
                    })
                })            
            }
            return true;
            //return activeProjectsArr.length>0;
        };

        vm.billedUsersfilterFn = function(item) {
            if(item && item.billDates && item.billDates.length>0) {
                return !item.billDates[0].end;
            }
        };

        vm.filterFn = function(item) {
            return !item.end;
            };

        function getProjectUsers() {
            ProjectService.getProjectUsers().then(function(response) {
                vm.projects = response;
            }, function(error) {
                console.log(error);
            });
        }
            
        vm.viewAssignUser = function(project, user) {
            if (!user) {
                var user = {};
                user.isNew = true;
            } else {
                user.isNew = false;
            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'projects/assignUserModel.html',
                controller: 'Projects.AssignUserModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function() {
                        return user;
                    },
                    project: function() {
                        return project;
                    }
                }
            });

            modalInstance.result.then(function(userObj) {
                getProjectUsers();
            }, function() {
                getProjectUsers();
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

    function searchProjectUser($filter) {
        return function(input, searchObj) {
            var output = input;
            if (searchObj.projectName && searchObj.projectName.length > 0) {
                output = $filter('filter')(output, { projectName: searchObj.projectName });
            }
            if (searchObj.projectStatus && searchObj.projectStatus != "All") {
                if(searchObj.projectStatus == "Active"){
                    output = $filter('filter')(output, { isActive: true});
                }else if(searchObj.projectStatus == "Inactive"){
                    output = $filter('filter')(output, { isActive: false});
                }
            }
            if (searchObj.projectType && searchObj.projectType.length > 0 && searchObj.projectType != 'all') {
                output = $filter('filter')(output, function(item) {
                    return (searchObj.projectType == item.projectType);
                });
            }
            if (searchObj.businessUnit && searchObj.businessUnit.length > 0 && searchObj.businessUnit != "All") {
                output = $filter('filter')(output, { businessUnit: searchObj.businessUnit });
            }
            return output;
        }
    }

    function UserProjectsController(UserService, ProjectService, _, $uibModal) {
        var vm = this;
        vm.user = {};
        vm.users = [];
        vm.search = {
            userName: "",
            userResourceType: ""
        };

        function getUserProjects() {
            ProjectService.getUserProjects().then(function(response) {
                vm.users = response;
            }, function(error) {
                console.log(error);
            });
        }

        vm.activeProjectsfilterFn = function(item) {
            var activeProjectsArr = [];
           
            if(item) {
                _.each(item.projects, function(billDatesArr) {
                    _.each(billDatesArr.billDates, function(billDatesObj){
                        var currentDate = new Date();                       
                        if(!billDatesObj.end || (billDatesObj.end > currentDate)) {
                            activeProjectsArr.push(billDatesObj.end);    
                        }
                    })
                })            
            }
            return activeProjectsArr.length>0;
        };

        vm.billedUsersfilterFn = function(item) {
            var activeProjectsArr = [];
            if(item && item.billDates && item.billDates.length>0) {
                if(item && item.billDates && item.billDates.length>1) {
                _.each(item.billDates, function(billDatesObj) {
                    var currentDate = new Date();
                       
                    if(!billDatesObj.end || (billDatesObj.end > currentDate)) {
                        activeProjectsArr.push(billDatesObj.end);    
                    }
                })
                return activeProjectsArr.length>0;
            }
                return !item.billDates[0].end;
            }
        };

        vm.filterFn = function(item) {
            return !item.end;
            };

        vm.viewAssignUser = function(user, project) {
            user.isNew = false;
            if (project) {
                user.billDates = project.billDates;
                project._id = project.projectId;
            } else {
                project = {};
            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'projects/assignUserModel.html',
                controller: 'Projects.AssignUserModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function() {
                        return user;
                    },
                    project: function() {
                        return project;
                    }
                }
            });

            modalInstance.result.then(function(userObj) {
                getUserProjects();
            }, function() {
                getUserProjects();
            });
        }

        initController();

        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin !== true) {

                }
            });
            getUserProjects();
        }
    };

    function searchUserProject($filter) {
        return function(input, searchObj) {
            var output = input;
            if (searchObj.userName && searchObj.userName.length > 0) {
                output = $filter('filter')(output, { userName: searchObj.userName });
            }
            if (searchObj.userResourceType && searchObj.userResourceType.length > 0) {
                // console.log(searchObj.userResourceType);
                output = $filter('filter')(output, function(item) {
                    return (searchObj.userResourceType == item.userResourceType);
                });
            }
            return output;
        }
    }

    function projectHierarchyController(UserService, ProjectService, _, $uibModal) {
        var vm = this;
        vm.user = {};
        vm.users = [];

        vm.projectOwnersArr = [];
        vm.projectNamesArr = [];

        vm.search = {
            userName: "",
            userResourceType: ""
        };


        function getAllUsers() {
                    UserService.GetAll().then(function(users) {
                        vm.users = users;
                        var projectOwnersArr = [];
                        var projectNamesArr = [];
                        debugger;
                        if (vm.users) {
                            _.each(users, function(user) {
                                if(user && user.projects) {
                               _.each(user.projects, function(project) {
                                projectOwnersArr.push(project.ownerName);
                                projectNamesArr.push(project.projectName);
                                console.log("owners and projects names : " , projectNamesArr,projectOwnersArr)
                               })
                            }
                            });
                        }
                    });
                };

        function getProjectUsers() {
            
                    ProjectService.getProjectUsers().then(function(response) {
                        vm.projects = response;
                        var projectOwnersArr = [];
                        var projectNamesArr = [];
        
                        _.each(vm.projects, function(projectObj) {

                            projectOwnersArr = _.find(vm.projects, { ownerName: projectObj.ownerName });
                            projectNamesArr = _.find(vm.projects, { projectName: projectObj.projectName });

                            vm.projectOwnersArr.push(projectObj.ownerName);
                            vm.projectNamesArr.push(projectObj.projectName);
                           
                        })
                    }, function(error) {
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
            getAllUsers();
            getProjectUsers();
        }
    };


})();