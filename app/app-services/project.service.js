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
        service.getAssignedUsers = getAssignedUsers;
        service.assignUsers = assignUsers;
        service.assignUser = assignUser;
        service.unassignUser = unassignUser;
        service.getClients = getClients;
        service.createClient = createClient;
        service.updateClient = updateClient;
        service.deleteClient = deleteClient;
        service.getProjectUsers = getProjectUsers;
        service.getUserProjects = getUserProjects;
        service.getProjectsWithUserCount = getProjectsWithUserCount;

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

        function getAssignedUsers(_id) {
            return $http.get('/api/projects/assignedUsers/' + _id).then(handleSuccess, handleError);
        }

        function assignUsers(_id, users) {
            return $http.post('/api/projects/assignedUsers/' + _id, users).then(handleSuccess, handleError);
        }

        function assignUser(_id, user) {
            return $http.post('/api/projects/assignUser/' + _id, user).then(handleSuccess, handleError);
        }

        function unassignUser(_id, userId) {
            return $http.delete('/api/projects/assignUser/' + _id + '/' + userId).then(handleSuccess, handleError);
        }

        function getClients() {
            return $http.get('/api/projects/clients').then(handleSuccess, handleError);
        }

        function createClient(client) {
            return $http.post('/api/projects/client', client).then(handleSuccess, handleError);
        }

        function updateClient(client) {
            return $http.put('/api/projects/client/' + client._id, client).then(handleSuccess, handleError);
        }

        function deleteClient(_id) {
            return $http.delete('/api/projects/client/' + _id).then(handleSuccess, handleError);
        }

        function getProjectUsers() {
            return $http.get('/api/projects/projectUsers').then(handleSuccess, handleError);
        }

        function getUserProjects() {
            return $http.get('/api/projects/userProjects').then(handleSuccess, handleError);
        }

        function getProjectsWithUserCount() {
            return $http.get('/api/projects/projectsWithUserCount').then(handleSuccess, handleError);
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
