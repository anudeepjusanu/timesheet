(function () {
    'use strict';

    angular
        .module('app')
        .factory('TaxSavingService', TaxSavingService);

    function TaxSavingService($http, $q) {
        var service = {};
        service.getMyTaxSavings = getMyTaxSavings;
        service.getAccountTaxSavings = getAccountTaxSavings;
        service.getTaxSaving = getTaxSaving;
        service.addTaxSaving = addTaxSaving;
        service.updateTaxSaving = updateTaxSaving;
        service.deleteTaxSaving = deleteTaxSaving;

        service.getTaxSavingReceipts = getTaxSavingReceipts;
        service.getTaxSavingReceipt = getTaxSavingReceipt;
        service.addTaxSavingReceipt = addTaxSavingReceipt;
        service.updateTaxSavingReceipt = updateTaxSavingReceipt;
        service.deleteTaxSavingReceipt = deleteTaxSavingReceipt;

        return service;

        function getMyTaxSavings() {
            return $http.get('/api/taxSaving/').then(handleSuccess, handleError);
        }

        function getAccountTaxSavings() {
            return $http.get('/api/taxSaving/accountTaxSavings').then(handleSuccess, handleError);
        }

        function getTaxSaving(taxSavingId) {
            return $http.get('/api/taxSaving/' + taxSavingId).then(handleSuccess, handleError);
        }

        function addTaxSaving(formData) {
            return $http.post('/api/taxSaving/', formData).then(handleSuccess, handleError);
        }

        function updateTaxSaving(taxSavingId, formData) {
            return $http.put('/api/taxSaving/' + taxSavingId, formData).then(handleSuccess, handleError);
        }

        function deleteTaxSaving(taxSavingId) {
            return $http.delete('/api/taxSaving/' + taxSavingId).then(handleSuccess, handleError);
        }

        function getTaxSavingReceipts(taxSavingId) {
            return $http.get('/api/taxSaving/receipts/' + taxSavingId).then(handleSuccess, handleError);
        }

        function getTaxSavingReceipt(taxSavingReceiptId) {
            return $http.get('/api/taxSaving/receipt/' + taxSavingReceiptId).then(handleSuccess, handleError);
        }

        function addTaxSavingReceipt(formData) {
            return $http.post('/api/taxSaving/receipt', formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function updateTaxSavingReceipt(taxSavingReceiptId, formData) {
            return $http.post('/api/taxSaving/receipt/' + taxSavingReceiptId, formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        function deleteTaxSavingReceipt(taxSavingReceiptId) {
            return $http.delete('/api/taxSaving/receipt/' + taxSavingReceiptId).then(handleSuccess, handleError);
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