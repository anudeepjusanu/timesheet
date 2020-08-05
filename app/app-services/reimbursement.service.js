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
            return $http.post('/api/reimbursement/', formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function updateReimbursement(reimbursementId, formData) {
            return $http.put('/api/reimbursement/' + reimbursementId, formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function deleteReimbursement(reimbursementId) {
            return $http.delete('/api/reimbursement/' + reimbursementId).then(handleSuccess, handleError);
        }

        function getReimbursementItem(itemId) {
            return $http.get('/api/reimbursement/item/' + itemId).then(handleSuccess, handleError);
        }

        function addReimbursementItem(reimbursementId, formData) {
            return $http.post('/api/reimbursement/item/' + reimbursementId, formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function updateReimbursementItem(itemId, formData) {
            return $http.put('/api/reimbursement/item/' + itemId, formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function updateReimbursementItemFile(itemId, formData) {
            return $http.post('/api/reimbursement/itemFile/' + itemId, formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function deleteReimbursementItem(itemId) {
            return $http.delete('/api/reimbursement/item/' + itemId).then(handleSuccess, handleError);
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