(function() {
    'use strict';

    angular
        .module('app')
        .factory('TimesheetService', Service);

    function Service($http, $q) {
        var service = {};
        service.getMine = getMine;
        service.createTimesheet = createTimesheet;
        service.updateTimesheet = updateTimesheet;
        service.deleteTimesheet = deleteTimesheet;
        service.getTimesheet = getTimesheet;
        service.getReportByWeek = getReportByWeek;
        service.remind = remind;
        service.remindAll = remindAll;
        service.adminUpdate = adminUpdate;
        service.getReportByMonth = getReportByMonth;
        service.getProjectsWithUserCount = getProjectsWithUserCount;
        service.allUserHoursByWeek = allUserHoursByWeek;
        service.projectUserHoursByWeek = projectUserHoursByWeek;
        service.clientUserHoursByWeek = clientUserHoursByWeek;
        service.allUserHoursByMonth = allUserHoursByMonth;
        service.projectUserHoursByMonth = projectUserHoursByMonth;
        service.utilizationByMonth = utilizationByMonth;

        return service;

        function getMine() {
            return $http.get('/api/timesheet/week/mine').then(handleSuccess, handleError);
        }

        function createTimesheet(report) {
            return $http.post('/api/timesheet/', report).then(handleSuccess, handleError);
        }

        function updateTimesheet(id, obj) {
            return $http.put('/api/timesheet/' + id, obj).then(handleSuccess, handleError);
        }

        function deleteTimesheet(id) {
            return $http.delete('/api/timesheet/' + id).then(handleSuccess, handleError);
        }

        function getTimesheet(id) {
            return $http.get('/api/timesheet/'+id).then(handleSuccess, handleError);
        }

        function getReportByWeek(week) {
            return $http.get('/api/timesheet/week/' + week).then(handleSuccess, handleError);
        }

        function remind(id, week){
            return $http.get('/api/timesheet/remind/' +id+ '/'+week).then(handleSuccess, handleError);
        }

        function remindAll(){
            return $http.get('/api/timesheet/remind/all').then(handleSuccess, handleError);
        }

        function adminUpdate(id, obj) {
            return $http.put('/api/timesheet/admin/' + id, obj).then(handleSuccess, handleError);
        }

        function getReportByMonth(obj){
            return $http.post('/api/timesheet/month/report', obj).then(handleSuccess, handleError);
        }

        function getProjectsWithUserCount() {
            return $http.get('/api/projects/projectsWithUserCount').then(handleSuccess, handleError);
        }

        function allUserHoursByWeek(week) {
            return $http.get('/api/timesheet/allUserHoursByWeek/' + week).then(handleSuccess, handleError);
        }

        function projectUserHoursByWeek(week, projectId) {
            return $http.get('/api/timesheet/projectUserHoursByWeek/' + week + '/' + projectId).then(handleSuccess, handleError);
        }

        function clientUserHoursByWeek(week, clientId) {
            return $http.get('/api/timesheet/clientUserHoursByWeek/' + week + '/' + clientId).then(handleSuccess, handleError);
        }

        function allUserHoursByMonth(month, year) {
            return $http.get('/api/timesheet/allUserHoursByMonth/' + month + '/' + year).then(handleSuccess, handleError);
        }

        function projectUserHoursByMonth(month, year, projectId) {
            return $http.get('/api/timesheet/projectUserHoursByMonth/' + month + '/' + year + '/' + projectId).then(handleSuccess, handleError);
        }

        function utilizationByMonth(month, year) {
            return $http.get('/api/timesheet/utilizationByMonth/' + month + '/' + year ).then(handleSuccess, handleError);
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