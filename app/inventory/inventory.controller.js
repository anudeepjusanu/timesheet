(function () {
    'use strict';

    angular
        .module('app')
        .controller('Inventory.IndexController', InventoryController)
        .controller('Inventory.InventoryModel', InventoryModel)
        .controller('Inventory.AssignUserModel', AssignUserModel)
        .controller('Inventory.ChangeStatusModel', ChangeStatusModel)
        .controller('Inventory.HistoryModel', HistoryModel)
        .filter('InventorySearch', function ($filter) {
            return function (input, searchObj) {
                var output = input;
                var filterFields = ['deviceId', 'deviceType', 'deviceName', 'employeeId', 'userName', 'location', 'hostname', 'deviceBrand',
                    'deviceModel', 'deviceSerial', 'deviceOS', 'deviceCPU', 'deviceRAM', 'note'];
                _.each(filterFields, function (filterField) {
                    if (searchObj[filterField] && searchObj[filterField].length > 0) {
                        var searchQuery = {};
                        searchQuery[filterField] = searchObj[filterField];
                        output = $filter('filter')(output, searchQuery);
                    }
                });
                if (searchObj.deviceStatus && searchObj.deviceStatus.length > 0 && searchObj.deviceStatus != "All") {
                    if (searchObj.deviceStatus == "Working") {
                        output = $filter('filter')(output, function (item) {
                            return (item.deviceStatus == "Available" || item.deviceStatus == "Assigned");
                        });
                    } else {
                        output = $filter('filter')(output, function (item) {
                            return (item.deviceStatus == searchObj.deviceStatus);
                        });
                    }
                }
                return output;
            }
        });

    function InventoryController(UserService, ProjectService, InventoryService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.users = [];
        vm.inventories = [];
        vm.search = {
            deviceId: '',
            deviceName: '',
            orderBy: 'deviceId',
            orderDESC: false,
        }

        vm.sorting = function (orderBy) {
            if (vm.search.orderBy == orderBy) {
                vm.search.sortDESC = !vm.search.sortDESC;
            } else {
                vm.search.sortDESC = false;
            }
            vm.search.orderBy = orderBy;
        };
        vm.inventoryColumns = {
            "deviceId": { label: "Device ID", selected: true },
            "deviceType": { label: "Device Type", selected: true },
            "deviceName": { label: "Device Name", selected: false },
            "employeeId": { label: "Employee ID", selected: true },
            "userName": { label: "User", selected: true },
            "deviceStatus": { label: "Device Status", selected: true },
            "location": { label: "Location", selected: false },
            "hostname": { label: "Hostname", selected: false },
            "deviceBrand": { label: "Brand", selected: false },
            "deviceModel": { label: "Model", selected: false },
            "deviceSerial": { label: "Serial", selected: false },
            "deviceOS": { label: "OS", selected: false },
            "deviceCPU": { label: "CPU", selected: false },
            "deviceRAM": { label: "RAM", selected: false },
            "latestComment": { label: "Comment", selected: false },
            "purchaseDate": { label: "purchaseDate", selected: false },
            "note": { label: "Note", selected: false }
        };

        function getInventories() {
            InventoryService.getInventories().then(function (response) {
                vm.inventories = response.inventories;
                _.each(vm.inventories, function (inventoryObj) {
                    if (inventoryObj.assignedUser && inventoryObj.assignedUser.name) {
                        inventoryObj.userName = inventoryObj.assignedUser.name;
                        inventoryObj.employeeId = inventoryObj.assignedUser.employeeId;
                    }
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.viewInventoryForm = function (inventoryObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'inventory/inventoryForm.html',
                controller: 'Inventory.InventoryModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    inventoryObj: function () {
                        console.log("inventoryObj", inventoryObj)

                        return inventoryObj;
                    },
                    usersList: function () {
                        console.log("vm.users", vm.users)
                        return vm.users;
                    }
                }
            });

            modalInstance.result.then(function (userObj) {
                getInventories();
            }, function () {
                getInventories();
            });
        }

        vm.delInventory = function (inventoryObj) {
            if (confirm("Do you want to delete this item?")) {
                InventoryService.delInventory(inventoryObj._id).then(function (response) {
                    getInventories();
                }, function (error) {
                    console.log(error);
                    getInventories();
                });
            }
        }

        vm.inventoryAssignUser = function (inventoryObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'inventory/inventoryAssignUser.html',
                controller: 'Inventory.AssignUserModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    inventoryObj: function () {
                        return inventoryObj;
                    },
                    usersList: function () {
                        return vm.users;
                    }
                }
            }).result.then(function (userObj) {
                getInventories();
            }, function () {
                getInventories();
            });
        }

        vm.inventoryChangeStatus = function (inventoryObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'inventory/inventoryStatus.html',
                controller: 'Inventory.ChangeStatusModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    inventoryObj: function () {
                        return inventoryObj;
                    },
                    usersList: function () {
                        return vm.users;
                    }
                }
            }).result.then(function (userObj) {
                getInventories();
            }, function () {
                getInventories();
            });
        }

        vm.viewHistory = function (inventoryObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'inventory/inventoryHistory.html',
                controller: 'Inventory.HistoryModel',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    inventoryObj: function () {
                        return inventoryObj;
                    }
                }
            }).result.then(function (userObj) {
                getInventories();
            }, function () {
                getInventories();
            });
        }

        var getActiveUsers = function () {
            UserService.GetAll().then(function (users) {
                vm.users = $filter('filter')(users, { isActive: true });
            });
        }

        vm.stopPropagation = function (e) {
            e.stopPropagation();
        }



        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                getActiveUsers();
                getInventories();
            });
        }
        initController();
    };

    function InventoryModel($uibModalInstance, ProjectService, UserService, InventoryService, inventoryObj, usersList, noty) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.clients = [];
        vm.alerts = [];
        vm.temp = "sowmya"
        vm.inventoryObj = inventoryObj;
        vm.activeUsers = [...usersList];
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        vm.search = {
            clientId: ''
        }
        vm.saveInventory = function (inventoryForm) {
            if (inventoryForm.$valid) {
                if (vm.inventoryObj._id) {
                    InventoryService.updateInventory(vm.inventoryObj._id, vm.inventoryObj).then(function (response) {
                        noty.showSuccess("Device has been updated successfully!");
                        $uibModalInstance.close();
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    InventoryService.addInventory(vm.inventoryObj).then(function (response) {
                        noty.showSuccess("Device has been added successfully!");
                        $uibModalInstance.close();
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }
            } else {
                vm.alerts.push({ msg: "Please enter valid data", type: 'danger' });
            }
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }
        vm.closeInventory = function () {
            $uibModalInstance.close();
        }

        function getClients() {

            ProjectService.getClients().then(function (response) {
                vm.clients = response;
                vm.clients.unshift({ _id: "", "clientName": "All" });
                //vm.clients.unshift({ _id: "", "clientName": "None" });
            }, function (error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        function initController() {
            getClients();
        };
        initController();
    };

    function AssignUserModel($uibModalInstance, UserService, InventoryService, inventoryObj, usersList, noty) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.inventoryObj = inventoryObj;
        vm.assignObj = {
            userId: null
        };
        vm.activeUsers = [...usersList];
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        vm.activeUsers = _.sortBy(vm.activeUsers, 'name');
        vm.activeUsers.unshift({ _id: "", name: "None" });
        if (vm.inventoryObj.userId) {
            vm.assignObj.userId = vm.inventoryObj.userId;
        }

        vm.saveAssignUser = function (inventoryForm) {
            if (inventoryForm.$valid) {
                if (vm.inventoryObj._id) {
                    InventoryService.assignUser(vm.inventoryObj._id, vm.assignObj).then(function (response) {
                        noty.showSuccess("Device has been assigned successfully!");
                        $uibModalInstance.close();
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }
            } else {
                vm.alerts.push({ msg: "Please enter valid data", type: 'danger' });
            }
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }
        vm.closeAssignUser = function () {
            $uibModalInstance.close();
        }

        function initController() {

        };
        initController();
    };

    function ChangeStatusModel($uibModalInstance, InventoryService, inventoryObj, usersList, $filter, noty) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.inventoryObj = inventoryObj;
        vm.deviceObj = {};
        vm.activeUsers = [...usersList];
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        vm.activeUsers = _.sortBy(vm.activeUsers, 'name');
        vm.activeUsers.unshift({ _id: "", name: "None" });
        if (vm.inventoryObj.userId) {
            vm.deviceObj.userId = vm.inventoryObj.userId;
        }
        vm.deviceObj.action = (vm.inventoryObj.deviceStatus == "Assigned") ? 'Assign' : vm.inventoryObj.deviceStatus;

        vm.saveInventoryStatus = function (inventoryForm) {
            if (inventoryForm.$valid) {
                vm.deviceObj.affectedDate = new Date(vm.deviceObj.affDate);
                vm.deviceObj.affectedDate = $filter('date')(vm.deviceObj.affectedDate, "yyyy-MM-dd");
                if (vm.inventoryObj._id && (vm.deviceObj.action == "Assign" || vm.deviceObj.action == "Unassign")) {
                    if (vm.deviceObj.action == "Unassign") {
                        vm.deviceObj.userId = "";
                    }
                    InventoryService.assignUser(vm.inventoryObj._id, vm.deviceObj).then(function (response) {
                        noty.showSuccess("Device has been assigned successfully!");
                        $uibModalInstance.close();
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    vm.deviceObj.deviceStatus = vm.deviceObj.action;
                    InventoryService.changeStatus(vm.inventoryObj._id, vm.deviceObj).then(function (response) {
                        noty.showSuccess("Device status has been changed successfully!");
                        $uibModalInstance.close();
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }
            } else {
                vm.alerts.push({ msg: "Please enter valid data", type: 'danger' });
            }
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }
        vm.closeAssignUser = function () {
            $uibModalInstance.close();
        }

        function initController() {

        };
        initController();
    };

    function HistoryModel($uibModalInstance, inventoryObj, noty) {
        var vm = this;
        vm.inventoryObj = inventoryObj;

        vm.closeHistory = function () {
            $uibModalInstance.close();
        }

        function initController() {

        };
        initController();
    };

})();
