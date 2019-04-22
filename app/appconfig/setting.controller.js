(function () {
    'use strict';

    angular
        .module('app')
        .controller('AppConfig.SettingController', SettingController);

    function SettingController(UserService, AppConfigService, FlashService, noty) {
        var vm = this;
        vm.user = {};
        vm.settingObj = {};
        vm.alerts = [];
        vm.closeAlert = function(index) {
            vm.alerts.splice(index, 1);
        };

        vm.saveSettings = function(settingForm){
            if(settingForm.$valid){
                AppConfigService.addAppSetting(vm.settingObj).then(function(data){
                    if(data.length>0){
                        _.each(data, function(item){
                            vm.settingObj[item.keyName] = item.keyVal;
                        });
                    }
                    vm.alerts.push({ msg: "Successfully updated!", type: 'success' });
                }, function(errors){
                    console.log(errors);
                });
            }
        }

        function getSettings(){
            AppConfigService.getAppSettings().then(function(data){
                if(data.length>0){
                    _.each(data, function(item){
                        vm.settingObj[item.keyName] = item.keyVal;
                    });
                }
            }, function(errors){
                console.log(errors);
            });
        }
        
        initController();
        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getSettings();
        }
    }

})();