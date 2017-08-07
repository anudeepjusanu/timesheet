(function() {
    'use strict';

    angular
        .module('app')
        .factory('ReportService', Service);

    function Service($http, $q) {
        var service = {};
        service.GetMine = GetMine;
        service.getReportByWeek = getReportByWeek;
        service.Create = Create;
        service.remind = remind;
        service.remindAll = remindAll;

        return service;

        function GetMine() {
            return $http.get('/api/timesheet/week/mine').then(handleSuccess, handleError);
        }

        function getReportByWeek(week) {
            return $http.get('/api/timesheet/week/' + week).then(handleSuccess, handleError);
        }

        function Create(report) {
            return $http.post('/api/timesheet/', report).then(handleSuccess, handleError);
        }

        function Update(user) {
            return $http.put('/api/timesheet/' + user._id, user).then(handleSuccess, handleError);
        }

        function remind(id, week){
            return $http.get('/api/timesheet/remind/' +id+ '/'+week).then(handleSuccess, handleError);
        }

        function remindAll(){
            return $http.get('/api/timesheet/remindAll').then(handleSuccess, handleError);   
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