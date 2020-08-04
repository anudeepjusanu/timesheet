(function () {
    'use strict';

    angular
        .module('app')
        .factory('ReimbursementService', ReimbursementService);

    function ReimbursementService($http, $q) {
        var service = {};
        service.getMyReimbursements = getMyReimbursements;

        return service;

        function getMyReimbursements() {
            return $http.get('/api/reimbursement/').then(handleSuccess, handleError);
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