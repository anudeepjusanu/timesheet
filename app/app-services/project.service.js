(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProjectService', Service);

    function Service($http, $q) {
        var service = {};

        service.getAll = getAll;
        service.getById = getById;
        service.create = create;
        service.update = update;
        service.delete = del;

        return service;

        function getAll() {
            return $http.get('/api/projects/all').then(handleSuccess, handleError);
        }

        function getById(_id) {
            return $http.get('/api/projects/' + _id).then(handleSuccess, handleError);
        }

        function create(project) {
            return $http.post('/api/projects', project).then(handleSuccess, handleError);
        }

        function update(project) {
            return $http.put('/api/projects/' + project._id, project).then(handleSuccess, handleError);
        }

        function del(_id) {
            return $http.delete('/api/projects/' + _id).then(handleSuccess, handleError);
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
