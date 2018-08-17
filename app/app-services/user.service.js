(function() {
    'use strict';

    angular
        .module('app')
        .factory('UserService', Service);

    function Service($http, $q) {
        var service = {};

        service.login = login;
        service.logout = logout;
        service.GetCurrent = GetCurrent;
        service.GetAll = GetAll;
        service.getUsers = getUsers;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.GetEmployeeInfo = GetEmployeeInfo;
        service.UpdateEmployeeInfo = UpdateEmployeeInfo;
        service.releaseToPool = releaseToPool;
        service.releaseFromPool = releaseFromPool;
        service.userPoolLogs = userPoolLogs;
        service.getUserRoles = getUserRoles;

        return service;

        function login(loginObj) {
            return $http.post('/login', loginObj).then(handleSuccess, handleError);
        }

        function logout() {
            return $http.get('/login').then(handleSuccess, handleError);
        }

        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }

        function GetAll() {
            return $http.get('/api/users/all').then(handleSuccess, handleError);
        }

        function getUsers() {
            return $http.get('/api/users/getUsers').then(handleSuccess, handleError);
        }

        function GetById(_id) {
            return $http.get('/api/users/admin/' + _id).then(handleSuccess, handleError);
        }

        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }

        function Update(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function GetEmployeeInfo(_id) {
            return $http.get('/api/users/admin/' + _id).then(handleSuccess, handleError);
        }

        function UpdateEmployeeInfo(_id, employee) {
            return $http.put('/api/users/adminUpdate/' + _id, employee).then(handleSuccess, handleError);
        }

        function releaseToPool(_id, params) {
            return $http.post('/api/users/releaseToPool/' + _id, params).then(handleSuccess, handleError);
        }

        function releaseFromPool(_id, params) {
            return $http.post('/api/users/releaseFromPool/' + _id, params).then(handleSuccess, handleError);
        }

        function userPoolLogs(_id) {
            return $http.get('/api/users/userPoolLogs/' + _id).then(handleSuccess, handleError);
        }

        function getUserRoles() {
            return [{ id: "employee", name: "Employee" }, { id: "lead", name: "Lead" }, { id: "manager", name: "Manager" }];
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