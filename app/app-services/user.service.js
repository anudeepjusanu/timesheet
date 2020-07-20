(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', Service);

    function Service($http, $q) {
        var service = {};

        service.login = login;
        service.loginAsUser = loginAsUser;
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
        service.updatePushToken = updatePushToken;
        service.remindUserByMessage = remindUserByMessage;
        service.getMyLeaveWallet = getMyLeaveWallet;
        service.getMyLeaveWalletBalance = getMyLeaveWalletBalance;
        service.updateUserLeaveBalance = updateUserLeaveBalance;

        service.getAllUserSkillProfiles = getAllUserSkillProfiles;
        service.addUserSkill = addUserSkill;
        service.updateUserSkill = updateUserSkill;
        service.deleteUserSkill = deleteUserSkill;

        return service;

        function login(loginObj) {
            return $http.post('/login', loginObj).then(handleSuccess, handleError);
        }

        function loginAsUser(loginObj) {
            return $http.post('/api/users/loginAsUser', loginObj).then(handleSuccess, handleError);
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
            return [
                { id: "employee", name: "Employee" },
                { id: "lead", name: "Lead" },
                { id: "manager", name: "Manager" },
                { id: "itsupport", name: "IT Support" }
            ];
        }

        function updatePushToken(user) {
            return $http.put('/api/users/updatePushToken/' + user._id, user).then(handleSuccess, handleError);
        }

        function remindUserByMessage(userId, message) {
            return $http.post('/api/users/remind/user/' + userId, message).then(handleSuccess, handleError);
        }

        function getMyLeaveWallet(financeYear) {
            return $http.get('/api/users/myLeaveWallet/' + financeYear).then(handleSuccess, handleError);
        }

        function getMyLeaveWalletBalance() {
            return $http.get('/api/users/myLeaveWalletBalance/').then(handleSuccess, handleError);
        }

        function updateUserLeaveBalance(_id, obj) {
            return $http.post('/api/leaves/updateUserLeaveBalance/' + _id, obj).then(handleSuccess, handleError);
        }


        function getAllUserSkillProfiles() {
            return $http.get('/api/skills/allUserSkills/').then(handleSuccess, handleError);
        }

        function addUserSkill(userSkillData) {
            return $http.post('/api/skills/userSkill/', userSkillData).then(handleSuccess, handleError);
        }

        function updateUserSkill(userSkillId, userSkillData) {
            return $http.put('/api/skills/userSkill/' + userSkillId, userSkillData).then(handleSuccess, handleError);
        }

        function deleteUserSkill(userSkillId) {
            return $http.delete('/api/skills/userSkill/' + userSkillId).then(handleSuccess, handleError);
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