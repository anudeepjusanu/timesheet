(function () {
    'use strict';

    angular
        .module('app')
        .controller('Inventory.IndexController', InventoryController)
        .controller('Inventory.InventoryModel', InventoryModel)
        .controller('Inventory.AssignUserModel', AssignUserModel)
        .controller('Inventory.HistoryModel', HistoryModel)
        .filter('InventorySearch', function ($filter) {
            return function (input, searchObj) {
                var output = input;
                if (searchObj.userName && searchObj.userName.length > 0) {
                    output = $filter('filter')(output, { name: searchObj.userName });
                }
                if (searchObj.userResourceType && searchObj.userResourceType.length > 0) {
                    output = $filter('filter')(output, function (item) {
                        return (searchObj.userResourceType == item.userResourceType);
                    });
                }
                if (searchObj.employeeCategory && searchObj.employeeCategory.length > 0 && searchObj.employeeCategory != "All") {
                    output = $filter('filter')(output, function (item) {
                        return (searchObj.employeeCategory == item.employeeCategory);
                    });
                }
                return output;
            }
        });

    function InventoryController(UserService, InventoryService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.users = [];
        vm.inventories = [];
        vm.search = {
            deviceId: '',
            deviceName: '',
            orderBy: 'deviceId',
            orderDESC: false
        }
        vm.sorting = function (orderBy) {
            if (vm.search.orderBy == orderBy) {
                vm.search.sortDESC = !vm.search.sortDESC;
            } else {
                vm.search.sortDESC = false;
            }
            vm.search.orderBy = orderBy;
        };

        function getInventories() {
            InventoryService.getInventories().then(function (response) {
                vm.inventories = response.inventories;
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
                        return inventoryObj;
                    },
                    usersList: function () {
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

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                getActiveUsers();
                getInventories();
            });
        }
        initController();
    };

    function InventoryModel($uibModalInstance, UserService, InventoryService, inventoryObj, usersList, noty) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.inventoryObj = inventoryObj;
        vm.activeUsers = [...usersList];
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        console.log(usersList);

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

        function initController() {

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
