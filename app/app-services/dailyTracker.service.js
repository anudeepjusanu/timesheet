(function () {
    'use strict';

    angular
        .module('app')
        .factory('DailyTrackerService', DailyTrackerService);

    function DailyTrackerService($http, $q) {
        var service = {};
        service.getUserDailyTrackerTasks = getUserDailyTrackerTasks;
        service.getDailyTrckerTask = getDailyTrckerTask;
        service.addDailyTrackerTask = addDailyTrackerTask;
        service.updateDailyTrackerTask = updateDailyTrackerTask;
        service.delDailyTrackerTask = delDailyTrackerTask;

        service.getDailyTaskCategories = getDailyTaskCategories;
        service.getDailyTaskCategory = getDailyTaskCategory;
        service.addDailyTaskCategory = addDailyTaskCategory;
        service.updateDailyTaskCategory = updateDailyTaskCategory;
        service.delDailyTaskCategory = delDailyTaskCategory;

        return service;

        function getUserDailyTrackerTasks() {
            return $http.get('/api/dailyTracker/myDailyTrackerTasks/').then(handleSuccess, handleError);
        }

        function getDailyTrckerTask(dailyTrackerTaskId) {
            return $http.get('/api/dailyTracker/dailyTrackerTask/' + dailyTrackerTaskId).then(handleSuccess, handleError);
        }

        function addDailyTrackerTask(dailyTrackerTaskObj) {
            return $http.post('/api/dailyTracker/dailyTrackerTask/', dailyTrackerTaskObj).then(handleSuccess, handleError);
        }

        function updateDailyTrackerTask(dailyTrackerTaskId, dailyTrackerTaskObj) {
            return $http.put('/api/dailyTracker/dailyTrackerTask/' + dailyTrackerTaskId, dailyTrackerTaskObj).then(handleSuccess, handleError);
        }

        function delDailyTrackerTask(dailyTrackerTaskId) {
            return $http.delete('/api/dailyTracker/dailyTrackerTask/' + dailyTrackerTaskId).then(handleSuccess, handleError);
        }

        /** Daily Task Categories */
        function getDailyTaskCategories() {
            return $http.get('/api/dailyTracker/dailyTaskCategories').then(handleSuccess, handleError);
        }

        function getDailyTaskCategory() {
            return $http.get('/api/dailyTracker/dailyTaskCategory').then(handleSuccess, handleError);
        }

        function addDailyTaskCategory(dailyTaskCategoryData) {
            return $http.post('/api/dailyTracker/dailyTaskCategory', dailyTaskCategoryData).then(handleSuccess, handleError);
        }

        function updateDailyTaskCategory(dailyTaskCategoryData) {
            return $http.put('/api/dailyTracker/dailyTaskCategory/' + dailyTaskCategoryData._id, dailyTaskCategoryData).then(handleSuccess, handleError);
        }

        function delDailyTaskCategory(dailyTaskCategoryData) {
            return $http.delete('/api/dailyTracker/dailyTaskCategory/' + dailyTaskCategoryData._id).then(handleSuccess, handleError);
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