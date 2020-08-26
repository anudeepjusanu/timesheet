(function () {
    'use strict';

    angular
        .module('app')
        .factory('ReimbursementService', ReimbursementService);

    function ReimbursementService($http, $q) {
        var service = {};
        service.getMyReimbursements = getMyReimbursements;
        service.getTeamReimbursements = getTeamReimbursements;
        service.getAccountReimbursements = getAccountReimbursements;
        service.getReimbursement = getReimbursement;
        service.addReimbursement = addReimbursement;
        service.updateReimbursement = updateReimbursement;
        service.deleteReimbursement = deleteReimbursement;

        service.approveReimbursement = approveReimbursement;
        service.rejectReimbursement = rejectReimbursement;
        service.expensesApproveReimbursement = expensesApproveReimbursement;
        service.expencesRejectReimbursement = expencesRejectReimbursement;
        service.paymentProcessReimbursement = paymentProcessReimbursement;

        service.getMyReceipts = getMyReceipts;
        service.getApproveReceipts = getApproveReceipts;
        service.getReimbursementReceipt = getReimbursementReceipt;
        service.addReimbursementReceipt = addReimbursementReceipt;
        service.updateReimbursementReceipt = updateReimbursementReceipt;
        service.updateReimbursementReceiptFile = updateReimbursementReceiptFile;
        service.approveReimbursementReceipt = approveReimbursementReceipt;
        service.rejectReimbursementReceipt = rejectReimbursementReceipt;
        service.deleteReimbursementReceipt = deleteReimbursementReceipt;
        service.getReimbursementCategories = getReimbursementCategories;
        service.getReimbursementStatus = getReimbursementStatus;
        service.getApproveUsersList = getApproveUsersList;
        service.getActiveProjectsList = getActiveProjectsList;

        return service;

        function getMyReimbursements() {
            return $http.get('/api/reimbursement/').then(handleSuccess, handleError);
        }
        function getTeamReimbursements() {
            return $http.get('/api/reimbursement/teamReimbursements').then(handleSuccess, handleError);
        }
        function getAccountReimbursements() {
            return $http.get('/api/reimbursement/accountReimbursements').then(handleSuccess, handleError);
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

        function approveReimbursement(reimbursementId, formData = {}) {
            return $http.put('/api/reimbursement/approveReimbursement/' + reimbursementId, formData).then(handleSuccess, handleError);
        }

        function rejectReimbursement(reimbursementId, formData = {}) {
            return $http.put('/api/reimbursement/rejectReimbursement/' + reimbursementId, formData).then(handleSuccess, handleError);
        }

        function expensesApproveReimbursement(reimbursementId, formData = {}) {
            return $http.put('/api/reimbursement/expensesApproveReimbursement/' + reimbursementId, formData).then(handleSuccess, handleError);
        }

        function expencesRejectReimbursement(reimbursementId, formData = {}) {
            return $http.put('/api/reimbursement/expencesRejectReimbursement/' + reimbursementId, formData).then(handleSuccess, handleError);
        }

        function paymentProcessReimbursement(reimbursementId, formData = {}) {
            return $http.put('/api/reimbursement/paymentProcessReimbursement/' + reimbursementId, formData).then(handleSuccess, handleError);
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

        function approveReimbursementReceipt(receiptId, formData = {}) {
            return $http.put('/api/reimbursement/approveReimbursementReceipt/' + receiptId, formData).then(handleSuccess, handleError);
        }

        function rejectReimbursementReceipt(receiptId, formData = {}) {
            return $http.put('/api/reimbursement/rejectReimbursementReceipt/' + receiptId, formData).then(handleSuccess, handleError);
        }

        function deleteReimbursementReceipt(receiptId) {
            return $http.delete('/api/reimbursement/receipt/' + receiptId).then(handleSuccess, handleError);
        }

        function getApproveUsersList() {
            return $http.get('/api/reimbursement/approveUsersList/').then(handleSuccess, handleError);
        }

        function getActiveProjectsList() {
            return $http.get('/api/reimbursement/activeProjectsList/').then(handleSuccess, handleError);
        }

        function getReimbursementStatus() {
            return [
                "All",
                "New",
                "Submitted",
                "Approved",
                "Rejected",
                "Expenses Approved",
                "Expenses Rejected",
                "Payment Processed"
            ];
        }

        function getReimbursementCategories() {
            return [
                { "categoryTypeId": "Business Cards", "categoryTypeVal": "Business Cards" },
                { "categoryTypeId": "Computer Peripherals", "categoryTypeVal": "Computer Peripherals" },
                { "categoryTypeId": "Conveyance Expenses", "categoryTypeVal": "Conveyance Expenses" },
                { "categoryTypeId": "Domain & Renewals", "categoryTypeVal": "Domain & Renewals" },
                { "categoryTypeId": "Dues", "categoryTypeVal": "Dues" },
                { "categoryTypeId": "Electricity Expense", "categoryTypeVal": "Electricity Expense" },
                { "categoryTypeId": "Food Expense", "categoryTypeVal": "Food Expense" },
                { "categoryTypeId": "Legal Fees", "categoryTypeVal": "Legal Fees" },
                { "categoryTypeId": "License Fees", "categoryTypeVal": "License Fees" },
                { "categoryTypeId": "Internet Expense", "categoryTypeVal": "Internet Expense" },
                { "categoryTypeId": "Mileage", "categoryTypeVal": "Mileage" },
                { "categoryTypeId": "Office Supplies", "categoryTypeVal": "Office Supplies" },
                { "categoryTypeId": "Passport fee", "categoryTypeVal": "Passport fee" },
                { "categoryTypeId": "Postage", "categoryTypeVal": "Postage" },
                { "categoryTypeId": "Printer Cartridges", "categoryTypeVal": "Printer Cartridges" },
                { "categoryTypeId": "Printer Paper", "categoryTypeVal": "Printer Paper" },
                { "categoryTypeId": "Postage & Courier", "categoryTypeVal": "Postage & Courier" },
                { "categoryTypeId": "Printing & Stationary", "categoryTypeVal": "Printing & Stationary" },
                { "categoryTypeId": "Proffessional Charges", "categoryTypeVal": "Proffessional Charges" },
                { "categoryTypeId": "Software", "categoryTypeVal": "Software" },
                { "categoryTypeId": "Stationery", "categoryTypeVal": "Stationery" },
                { "categoryTypeId": "Subscriptions", "categoryTypeVal": "Subscriptions" },
                { "categoryTypeId": "Staff Welfare / Team Lunch", "categoryTypeVal": "Staff Welfare / Team Lunch" },
                { "categoryTypeId": "Telephone Expenses", "categoryTypeVal": "Telephone Expenses" },
                { "categoryTypeId": "Tools", "categoryTypeVal": "Tools" },
                { "categoryTypeId": "Training Fees", "categoryTypeVal": "Training Fees" },
                { "categoryTypeId": "Travel", "categoryTypeVal": "Travel" },
                { "categoryTypeId": "Rent Expenses", "categoryTypeVal": "Rent Expenses" },
                { "categoryTypeId": "Work Clothing", "categoryTypeVal": "Work Clothing" },
                { "categoryTypeId": "Vehicle Maintenance", "categoryTypeVal": "Vehicle Maintenance" },
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