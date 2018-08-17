(function() {
    'use strict';

    angular
        .module('app')
        .controller('Surveys.IndexController', SuveysController)
        .controller('Surveys.AddSurveyController', AddSurveyController);

    function SuveysController(UserService, _, SurveyService) {
        var vm = this;
        vm.surveys = [];

        function getAllSurveys() {
            SurveyService.getAll().then(function(response) {
                vm.surveys = response;
            }, function(error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin !== true) {

                }
            });
            getAllSurveys();
        }
        initController();
    };

    function AddSurveyController(UserService, _, SurveyService) {
        var vm = this;
        vm.survey = {};
        vm.survey.questions = [{
            "question": "",
            "options": []
        }];
        vm.addQuestion = addQuestion;
        vm.postSurvey = postSurvey;

        function addQuestion() {
            vm.survey.questions.push({
                "question": "",
                "options": []
            });
        };

        function postSurvey(surveyForm) {
            if (surveyForm.$valid) {
                console.log(vm.survey);
                console.log(vm.user);
                vm.survey.createdBy = vm.user.name;
                SurveyService.create(vm.survey).then(function(response) {
                    noty.showSuccess("New Project has been added successfully!");
                }, function(error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                });
            }
        };

        function initController() {
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
                if (vm.user.admin !== true) {

                }
            });
        };
        initController();
    };
})();