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
        // service.updateReimbursement = updateReimbursement;
        // service.deleteReimbursement = deleteReimbursement;
        // service.getReimbursementItem = getReimbursementItem;
        // service.addReimbursementItem = addReimbursementItem;
        // service.updateReimbursementItem = updateReimbursementItem;
        // service.updateReimbursementItemFile = updateReimbursementItemFile;
        // service.deleteReimbursementItem = deleteReimbursementItem;

        return service;

        function getMyReimbursements() {
            return $http.get('/api/reimbursement/').then(handleSuccess, handleError);
        }

        function getReimbursement(reimbursementId) {
            return $http.get('/api/reimbursement/5f27c557517e74bf473d8fcc', + reimbursementId).then(handleSuccess, handleError);
        }

        function addReimbursement(reimbursementId, fileFormData, obj) {
            return $http.post('/api/reimbursement/item/' + reimbursementId, fileFormData, obj).then(handleSuccess, handleError);
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