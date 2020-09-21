(function () {
    'use strict';

    angular
        .module('app')
        .factory('JobOpeningService', JobOpeningService);

    function JobOpeningService($http, $q) {
        var service = {};
        service.getActiveJobOpenings = getActiveJobOpenings;
        service.addReferJobOpening = addReferJobOpening;

        service.getAllJobOpenings = getAllJobOpenings;
        service.getJobOpening = getJobOpening;
        service.addJobOpening = addJobOpening;
        service.updateJobOpening = updateJobOpening;
        service.delJobOpening = delJobOpening;

        return service;

        function getActiveJobOpenings(paramObj = {}) {
            return $http.get('/api/jobOpening/activeJobOpenings/', paramObj).then(handleSuccess, handleError);
        }

        function addReferJobOpening(paramObj = {}) {
            return $http.post('/api/jobOpening/referJobOpening/', paramObj, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(handleSuccess, handleError);
        }

        /** Manage Job Openings */
        function getAllJobOpenings() {
            return $http.get('/api/jobOpening/jobOpenings').then(handleSuccess, handleError);
        }

        function getJobOpening(jobOpeningId) {
            return $http.get('/api/jobOpening/jobOpening/' + jobOpeningId).then(handleSuccess, handleError);
        }

        function addJobOpening(jobOpeningData) {
            return $http.post('/api/jobOpening/jobOpening', jobOpeningData).then(handleSuccess, handleError);
        }

        function updateJobOpening(jobOpeningData) {
            return $http.put('/api/jobOpening/jobOpening/' + jobOpeningData._id, jobOpeningData).then(handleSuccess, handleError);
        }

        function delJobOpening(jobOpeningData) {
            return $http.delete('/api/jobOpening/jobOpening/' + jobOpeningData._id).then(handleSuccess, handleError);
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