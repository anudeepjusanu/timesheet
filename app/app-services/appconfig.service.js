(function () {
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

        service.getMetaSkills = getMetaSkills;
        service.getMetaSkill = getMetaSkill;
        service.addMetaSkill = addMetaSkill;
        service.updateMetaSkill = updateMetaSkill;
        service.delMetaSkill = delMetaSkill;

        service.getSkillCategories = getSkillCategories;
        service.getSkillCategory = getSkillCategory;
        service.addSkillCategory = addSkillCategory;
        service.updateSkillCategory = updateSkillCategory;
        service.delSkillCategory = delSkillCategory;

        return service;

        /** Meta Skills */
        function getMetaSkills() {
            return $http.get('/api/skills/metaSkills').then(handleSuccess, handleError);
        }

        function getMetaSkill() {
            return $http.get('/api/skills/metaSkill').then(handleSuccess, handleError);
        }

        function addMetaSkill(metaSkillData) {
            return $http.post('/api/skills/metaSkill', metaSkillData).then(handleSuccess, handleError);
        }

        function updateMetaSkill(metaSkillData) {
            return $http.put('/api/skills/metaSkill/' + metaSkillData._id, metaSkillData).then(handleSuccess, handleError);
        }

        function delMetaSkill(metaSkillData) {
            return $http.delete('/api/skills/metaSkill/' + metaSkillData._id).then(handleSuccess, handleError);
        }

        /** Skill Categories */
        function getSkillCategories() {
            return $http.get('/api/skills/skillCategories').then(handleSuccess, handleError);
        }

        function getSkillCategory() {
            return $http.get('/api/skills/skillCategory').then(handleSuccess, handleError);
        }

        function addSkillCategory(skillCategoryData) {
            return $http.post('/api/skills/skillCategory', skillCategoryData).then(handleSuccess, handleError);
        }

        function updateSkillCategory(skillCategoryData) {
            return $http.put('/api/skills/skillCategory/' + skillCategoryData._id, skillCategoryData).then(handleSuccess, handleError);
        }

        function delSkillCategory(skillCategoryData) {
            return $http.delete('/api/skills/skillCategory/' + skillCategoryData._id).then(handleSuccess, handleError);
        }

        /** App Settings */
        function getAppSettings() {
            return $http.get('/api/appconfig/settings').then(handleSuccess, handleError);
        }

        function getAppSetting(keyName) {
            return $http.get('/api/appconfig/setting/' + keyName).then(handleSuccess, handleError);
        }

        function addAppSetting(paramObj) {
            return $http.post('/api/appconfig/setting/', paramObj).then(handleSuccess, handleError);
        }

        function updateAppSetting(paramObj) {
            return $http.put('/api/appconfig/setting/', paramObj).then(handleSuccess, handleError);
        }

        function delAppSetting(keyName) {
            return $http.delete('/api/appconfig/setting/' + keyName).then(handleSuccess, handleError);
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