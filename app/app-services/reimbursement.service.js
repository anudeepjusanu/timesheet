(function () {
    'use strict';

    angular
        .module('app')
        .factory('ReimbursementService', ReimbursementService);

    function ReimbursementService($http, $q) {
        var service = {};
        service.getMyReimbursements = getMyReimbursements;
        service.getReimbursement = getReimbursement;
        service.addReimbursement = addReimbursement;
        service.updateReimbursement = updateReimbursement;
        service.deleteReimbursement = deleteReimbursement;
        service.getReimbursementItem = getReimbursementItem;
        service.addReimbursementItem = addReimbursementItem;
        service.updateReimbursementItem = updateReimbursementItem;
        service.updateReimbursementItemFile = updateReimbursementItemFile;
        service.deleteReimbursementItem = deleteReimbursementItem;
        service.getReimbursementCategories = getReimbursementCategories;

        return service;

        function getMyReimbursements() {
            return $http.get('/api/reimbursement/').then(handleSuccess, handleError);
        }

        function getReimbursement(reimbursementId) {
            return $http.get('/api/reimbursement/' + reimbursementId).then(handleSuccess, handleError);
        }

        function addReimbursement(formData) {
            return $http.post('/api/reimbursement/', formData).then(handleSuccess, handleError);
        }

        function updateReimbursement(reimbursementId, formData) {
            return $http.put('/api/reimbursement/' + reimbursementId, formData).then(handleSuccess, handleError);
        }

        function deleteReimbursement(reimbursementId) {
            return $http.delete('/api/reimbursement/' + reimbursementId).then(handleSuccess, handleError);
        }

        function getReimbursementItem(itemId) {
            return $http.get('/api/reimbursement/item/' + itemId).then(handleSuccess, handleError);
        }

        function addReimbursementItem(reimbursementId, formData) {
            return $http.post('/api/reimbursement/item/' + reimbursementId, formData).then(handleSuccess, handleError);
        }

        function updateReimbursementItem(itemId, formData) {
            return $http.put('/api/reimbursement/item/' + itemId, formData).then(handleSuccess, handleError);
        }

        function updateReimbursementItemFile(itemId, formData) {
            return $http.post('/api/reimbursement/itemFile/' + itemId, formData).then(handleSuccess, handleError);
        }

        function deleteReimbursementItem(itemId) {
            return $http.delete('/api/reimbursement/item/' + itemId).then(handleSuccess, handleError);
        }

        function getReimbursementCategories() {
            return [];
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