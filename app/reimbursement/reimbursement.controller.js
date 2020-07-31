(function () {
    'use strict';

    angular
        .module('app')
        .controller('Inventory.IndexController', InventoryController)
        ;

    function InventoryController(UserService, InventoryService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};


        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
        initController();
    };

})();
