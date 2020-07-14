
(function () {
    'use strict';

    angular
        .module('app')
        .controller('AppConfig.SkillCategoriesController', SkillCategoriesController)
        .controller('AppConfig.SkillCategoryModel', SkillCategoryModel);

    function SkillCategoriesController(UserService, AppConfigService, $uibModal, FlashService, noty) {
        var vm = this;
        vm.user = {};
        vm.skillCategories = [];

        function getSkillCategories() {
            AppConfigService.getSkillCategories().then(function (data) {
                if (data.skillCategories) {
                    vm.skillCategories = data.skillCategories;
                }
            }, function (errors) {
                console.log(errors);
            });
        }

        vm.viewSkillCategoryModel = function (skillCategoryObj) {
            var skillCategory = {};
            if (skillCategoryObj) {
                skillCategory = skillCategoryObj;
                skillCategory.isNew = false;
            } else {
                skillCategory.isNew = true;
            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'appconfig/skillCategoryForm.html',
                controller: 'AppConfig.SkillCategoryModel',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    skillCategory: function () {
                        return skillCategory;
                    }
                }
            });

            modalInstance.result.then(function (skillCategoryObj) {
                //vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
                getSkillCategories();
            }, function () {
                getSkillCategories();
            });
        }

        vm.delSkill = function (skillCategory) {
            if (confirm("Do you want to delete this meta skill ?")) {
                AppConfigService.delSkill(skillCategory).then(function (response) {
                    getSkillCategories();
                });
            }
        }

        initController();
        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getSkillCategories();
        }
    }

    function SkillCategoryModel($uibModalInstance, AppConfigService, noty, skillCategory) {
        var vm = this;
        vm.enableSaveBtn = true;
        vm.alerts = [];
        vm.skillCategory = skillCategory;

        vm.saveSkillCategory = function (form) {
            if (form.$valid) {
                console.log(vm.skillCategory);
                vm.enableSaveBtn = false;
                if (vm.skillCategory.isNew === true) {
                    AppConfigService.addSkillCategory({ skillCategoryName: vm.skillCategory.skillCategoryName }).then(function (response) {
                        noty.showSuccess("New Meta Skill Category has been created successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.skillCategory);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.skillCategory);
                    });
                } else {
                    AppConfigService.updateSkillCategory(vm.skillCategory).then(function (response) {
                        noty.showSuccess("Meta Skill Category has been updated successfully!");
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.skillCategory);
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                        vm.enableSaveBtn = true;
                        $uibModalInstance.close(vm.skillCategory);
                    });
                }
            } else {
                vm.enableSaveBtn = true;
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        };

        vm.cancelSkillCategory = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

})();