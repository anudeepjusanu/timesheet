(function () {
    'use strict';

    angular
        .module('app')
        .controller('AppConfig.SettingController', SettingController);

    function SettingController(UserService, AppConfigService, FlashService, noty) {
        var vm = this;
        vm.user = {};
        vm.settingObj = {};

        vm.saveSettings = function(settingForm){
            if(settingForm.$valid){
                AppConfigService.addAppSetting(vm.settingObj).then(function(data){
                    if(data.length>0){
                        _.each(data, function(item){
                            vm.settingObj[item.keyName] = item.keyVal;
                        });
                    }
                    noty.showSuccess("Successfully updated!");
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