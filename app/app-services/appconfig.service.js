(function() {
    'use strict';

    angular
        .module('app')
        .factory('AppConfigService', AppConfigService);

    function AppConfigService($http, $q) {
        var service = {};

        service.getAppSettings = getAppSettings;
        service.getAppSetting = getAppSetting;
        service.addAppSetting = addAppSetting;
        service.updateAppSetting = updateAppSetting;
        service.delAppSetting = delAppSetting;

        return service;

        function getAppSettings() {
            return $http.get('/api/appconfig/settings').then(handleSuccess, handleError);
        }

        function getAppSetting(keyName) {
            return $http.get('/api/appconfig/setting/'+keyName).then(handleSuccess, handleError);
        }

        function addAppSetting(paramObj) {
            return $http.post('/api/appconfig/setting/', paramObj).then(handleSuccess, handleError);
        }

        function updateAppSetting(paramObj) {
            return $http.put('/api/appconfig/setting/', paramObj).then(handleSuccess, handleError);
        }
        
        function delAppSetting(keyName) {
            return $http.delete('/api/appconfig/setting/'+keyName).then(handleSuccess, handleError);
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