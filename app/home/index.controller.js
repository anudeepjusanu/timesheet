(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller)
        .controller('Home.TimesheetController', TimesheetController);

    function Controller(UserService, $filter, ReportService) {
        var vm = this;

        vm.user = null;
        vm.post = post;
        vm.obj = {
            question: new Date()
        };

        function post(){
            $filter('date')(vm.obj.question, "yyyy-Www");
        }

        function getAllReports(){
            ReportService.getReportByWeek({'week': 'week'}).then(function(reports){
                console.log(reports);
            })
        }

        function getMyReport(){
            ReportService.getMine().then(function(reports){
                console.log(reports);
            })
        }

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                console.log($filter('date')(new Date(), "yyyy-Www"));
                /*if(vm.user.admin){
                    getAllReports();
                }else{
                    getMyReport();
                }*/
            });
        }
    }

    function TimesheetController(UserService, $filter, ReportService){
        var vm = this;
        vm.obj = {
            
        };
    }

})();