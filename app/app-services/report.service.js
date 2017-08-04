(function() {
    'use strict';

    angular
        .module('app')
        .factory('ReportService', Service);

    function Service($http, $q) {
        var service = {};
        service.GetMine = GetMine;
        service.getReportByWeek = getReportByWeek;

        return service;

        function GetMine() {
            return $http.get('/api/timesheet/week/mine').then(handleSuccess, handleError);
        }

        function getReportByWeek(week) {
            return $http.get('/api/timesheet/week/' + week).then(handleSuccess, handleError);
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }

        function Update(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
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