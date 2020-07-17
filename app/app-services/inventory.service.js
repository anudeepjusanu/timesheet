(function () {
    'use strict';

    angular
        .module('app')
        .factory('InventoryService', InventoryService);

    function InventoryService($http, $q) {
        var service = {};
        service.getInventories = getInventories;
        service.getInventory = getInventory;
        service.addInventory = addInventory;
        service.updateInventory = updateInventory;
        service.delInventory = delInventory;
        service.assignUser = assignUser;

        return service;

        function getInventories() {
            return $http.get('/api/inventory/inventories/').then(handleSuccess, handleError);
        }

        function getInventory(inventoryId) {
            return $http.get('/api/inventory/inventory/' + inventoryId).then(handleSuccess, handleError);
        }

        function addInventory(inventoryObj) {
            return $http.post('/api/inventory/inventory/', inventoryObj).then(handleSuccess, handleError);
        }

        function updateInventory(inventoryId, inventoryObj) {
            return $http.put('/api/inventory/inventory/' + inventoryId, inventoryObj).then(handleSuccess, handleError);
        }

        function delInventory(inventoryId) {
            return $http.delete('/api/inventory/inventory/' + inventoryId).then(handleSuccess, handleError);
        }

        function assignUser(inventoryId, assignObj) {
            return $http.put('/api/inventory/assignUser/' + inventoryId, assignObj).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();