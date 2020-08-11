
(function () {
    'use strict';

    angular
        .module('app')
        .controller('AppConfig.MetaSkillsController', MetaSkillsController)
        .controller('AppConfig.MetaSkillModel', MetaSkillModel);

    function MetaSkillsController(UserService, AppConfigService, $uibModal, FlashService, noty) {
        var vm = this;
        vm.user = {};
        vm.metaSkills = [];

        function getMetaSkills() {
            AppConfigService.getMetaSkills().then(function (data) {
                if (data.metaSkills) {
                    vm.metaSkills = data.metaSkills;
                }
            }, function (errors) {
                console.log(errors);
            });
        }

        vm.viewMetaSkillModel = function (metaSkillObj) {
            var metaSkill = {};
            if (metaSkillObj) {
                metaSkill = metaSkillObj;
                metaSkill.isNew = false;
            } else {
                metaSkill.isNew = true;
            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'appconfig/addMetaSkillModel.html',
                controller: 'AppConfig.MetaSkillModel',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    metaSkill: function () {
                        return metaSkill;
                    }
                }
            });

            modalInstance.result.then(function (metaSkillObj) {
                //vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
                getMetaSkills();
            }, function () {
                getMetaSkills();
            });
        }

        vm.delMetaSkill = function (metaSkill) {
            if (confirm("Do you want to delete this meta skill ?")) {
                AppConfigService.delMetaSkill(metaSkill).then(function (response) {
                    getMetaSkills();
                });
            }
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getMetaSkills();
        }
    }

    function MetaSkillModel($uibModalInstance, AppConfigService, noty, metaSkill) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.metaSkill = metaSkill;

        vm.ok = function (form) {
            if (form.$valid) {
                vm.enableSaveBtn = false;
                if (vm.metaSkill.isNew === true) {
                    AppConfigService.addMetaSkill({ skillName: vm.metaSkill.skillName }).then(function (response) {
                        noty.showSuccess("New Meta Skill has been created successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.metaSkill);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.metaSkill);
                    });
                } else {
                    AppConfigService.updateMetaSkill(vm.metaSkill).then(function (response) {
                        noty.showSuccess("Meta Skill has been updated successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.metaSkill);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.metaSkill);
                    });
                }
            } else {
                vm.enableSaveBtn = true;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

})();