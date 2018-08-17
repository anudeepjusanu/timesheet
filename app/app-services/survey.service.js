(function() {
    'use strict';

    angular
        .module('app')
        .factory('SurveyService', Service);

    function Service($http, $q) {
        var service = {};

        service.getAll = getAll;
        service.create = create;

        return service;

        function getAll() {
            return $http.get('/api/surveys/all').then(handleSuccess, handleError);
        }

        function create(suvey) {
            return $http.post('/api/surveys', suvey).then(handleSuccess, handleError);
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