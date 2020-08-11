(function () {
    'use strict';

    angular
        .module('app')
        .factory('ReimbursementService', ReimbursementService);

    function ReimbursementService($http, $q) {
        var service = {};
        service.getMyReimbursements = getMyReimbursements;
        service.getPendingReimbursements = getPendingReimbursements;
        service.getApprovedReimbursements = getApprovedReimbursements;
        service.getReimbursement = getReimbursement;
        service.addReimbursement = addReimbursement;
        service.updateReimbursement = updateReimbursement;
        service.deleteReimbursement = deleteReimbursement;

        service.getMyReceipts = getMyReceipts;
        service.getApproveReceipts = getApproveReceipts;
        service.getReimbursementReceipt = getReimbursementReceipt;
        service.addReimbursementReceipt = addReimbursementReceipt;
        service.updateReimbursementReceipt = updateReimbursementReceipt;
        service.updateReimbursementReceiptFile = updateReimbursementReceiptFile;
        service.deleteReimbursementReceipt = deleteReimbursementReceipt;
        service.getReimbursementCategories = getReimbursementCategories;
        service.getApproveUsersList = getApproveUsersList;

        return service;

        function getMyReimbursements() {
            return $http.get('/api/reimbursement/').then(handleSuccess, handleError);
        }
        function getPendingReimbursements() {
            return $http.get('/api/reimbursement/pendingReimbursements').then(handleSuccess, handleError);
        }
        function getApprovedReimbursements() {
            return $http.get('/api/reimbursement/approvedReimbursements').then(handleSuccess, handleError);
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

        function getMyReceipts() {
            return $http.get('/api/reimbursement/myReceipts/').then(handleSuccess, handleError);
        }

        function getApproveReceipts() {
            return $http.get('/api/reimbursement/approveReceipts/').then(handleSuccess, handleError);
        }

        function getReimbursementReceipt(receiptId) {
            return $http.get('/api/reimbursement/receipt/' + receiptId).then(handleSuccess, handleError);
        }

        function addReimbursementReceipt(formData) {
            return $http.post('/api/reimbursement/receipt', formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function updateReimbursementReceipt(receiptId, formData) {
            return $http.put('/api/reimbursement/receipt/' + receiptId, formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function updateReimbursementReceiptFile(receiptId, formData) {
            return $http.post('/api/reimbursement/receiptFile/' + receiptId, formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function deleteReimbursementReceipt(receiptId) {
            return $http.delete('/api/reimbursement/receipt/' + receiptId).then(handleSuccess, handleError);
        }

        function getApproveUsersList() {
            return $http.get('/api/reimbursement/approveUsersList/').then(handleSuccess, handleError);
        }

        function getReimbursementCategories() {
            return [
                { "categoryTypeId": "Business Cards", "categoryTypeVal": "Business Cards" },
                { "categoryTypeId": "Business Meals", "categoryTypeVal": "Business Meals" },
                { "categoryTypeId": "Dues", "categoryTypeVal": "Dues" },
                { "categoryTypeId": "Legal Fees", "categoryTypeVal": "Legal Fees" },
                { "categoryTypeId": "License Fees", "categoryTypeVal": "License Fees" },
                { "categoryTypeId": "Mileage", "categoryTypeVal": "Mileage" },
                { "categoryTypeId": "Office Supplies", "categoryTypeVal": "Office Supplies" },
                { "categoryTypeId": "Passport fee", "categoryTypeVal": "Passport fee" },
                { "categoryTypeId": "Postage", "categoryTypeVal": "Postage" },
                { "categoryTypeId": "Printer Cartridges", "categoryTypeVal": "Printer Cartridges" },
                { "categoryTypeId": "Printer Paper", "categoryTypeVal": "Printer Paper" },
                { "categoryTypeId": "Software", "categoryTypeVal": "Software" },
                { "categoryTypeId": "Stationery", "categoryTypeVal": "Stationery" },
                { "categoryTypeId": "Subscriptions", "categoryTypeVal": "Subscriptions" },
                { "categoryTypeId": "Telephones", "categoryTypeVal": "Telephones" },
                { "categoryTypeId": "Tools", "categoryTypeVal": "Tools" },
                { "categoryTypeId": "Training Fees", "categoryTypeVal": "Training Fees" },
                { "categoryTypeId": "Travel", "categoryTypeVal": "Travel" },
                { "categoryTypeId": "Work Clothing", "categoryTypeVal": "Work Clothing" },
                { "categoryTypeId": "Other", "categoryTypeVal": "Other" }
            ];
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