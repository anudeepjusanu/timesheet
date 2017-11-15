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
        service.getTimesheet = getTimesheet;
        service.getReportByWeek = getReportByWeek;
        /*service.Create = Create;
        service.Get = Get;
        service.Update = Update;
        service.remind = remind;
        service.remindAll = remindAll;
        service.adminUpdate = adminUpdate;
        service.getReportByMonth = getReportByMonth;*/

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

        function getTimesheet(id) {
            return $http.get('/api/timesheet/'+id).then(handleSuccess, handleError);
        }

        function getReportByWeek(week) {
            return $http.get('/api/timesheet/week/' + week).then(handleSuccess, handleError);
        }

        /*function Create(report) {
            return $http.post('/api/timesheet/', report).then(handleSuccess, handleError);
        }

        function getReportByWeek(week) {
            return $http.get('/api/timesheet/week/' + week).then(handleSuccess, handleError);
        }

        function Create(report) {
            return $http.post('/api/timesheet/', report).then(handleSuccess, handleError);
        }

        function Get(id) {
            return $http.get('/api/timesheet/'+id).then(handleSuccess, handleError);
        }

        function Update(id, obj) {
            return $http.put('/api/timesheet/' + id, obj).then(handleSuccess, handleError);
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
        }*/

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();