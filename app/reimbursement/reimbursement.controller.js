(function () {
    'use strict';

    angular
        .module('app')
        .controller('Reimbursement.IndexController', MyReimbursementsController)
        .controller('Reimbursement.TeamReimbursementsController', TeamReimbursementsController)
        .controller('Reimbursement.ReimbursementFormController', ReimbursementFormController)
        .controller('Reimbursement.TeamReimbursementsModalController', TeamReimbursementsModalController)
        .controller('Reimbursement.MyReimbursementStatusController', MyReimbursementStatusController)
        .directive('fileModel', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;

                    element.bind('change', function () {
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }]);

    function MyReimbursementsController(UserService, ReimbursementService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};

        function getMyReimbursements() {
            ReimbursementService.getMyReimbursements().then(function (response) {
                console.log("reimbursements", response);
                vm.reimbursements = response.reimbursements;
                for (var i = 0; i < vm.reimbursements.length; i++) {
                    vm.reimbursements[i].createdOn = JSON.stringify(vm.reimbursements[i].createdOn).split('T')[0].slice(1);
                }
            }, function (error) {
                console.log(error);
            });
        };

        vm.openMyReimbursementStatus = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'reimbursement/myReimbursementStatusModal.html',
                controller: 'Reimbursement.MyReimbursementStatusController',
                controllerAs: 'vm',
                size: 'xs'
            });
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getMyReimbursements();
        }
        initController();
    };

    function MyReimbursementStatusController(UserService, $uibModalInstance, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};

        vm.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
        initController();
    };

    function ReimbursementFormController(UserService, $scope, ReimbursementService, noty, $timeout, _, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.categories = ReimbursementService.getReimbursementCategories();
        vm.reimbursement = {
            items: []
        };

        vm.changeManager = function (projectID) {
            console.log("projectID", projectID);
            vm.reimbursement.managerName = vm.user.projects.find(obj => obj.projectId == projectID).ownerName;
        }

        vm.addBillDate = function (index, user) {
            if (!vm.reimbursement.items) {
                vm.reimbursement.items = [];
            }
            vm.reimbursement.items.push({ "file": vm.myFile });
        }

        vm.deleteBillDate = function (billDate, index) {
            vm.reimbursement.items.splice(index, 1);
        }

        vm.saveReimbursement = function (form, reimbursement, index) {

        };

        vm.saveReimbursementItem = function (itemData, itemIndex) {
            var itemFormData = new FormData();
            itemFormData.append('file', itemData.file);
            itemFormData.append('billDate', itemData.billDate);
            itemFormData.append('billCategory', itemData.billCategory);
            itemFormData.append('billAmount', itemData.billAmount);
            itemFormData.append('billDescription', itemData.billDescription);
            ReimbursementService.updateReimbursementItem('5f28017ffb3d756bac10ae6c', itemFormData).then(function (response) {
                noty.showSuccess("Reimbursement bill item has been updated successfully!");
            }, function (error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                if (false) {
                    vm.isNew = false;
                } else {
                    vm.isNew = true;
                }
                vm.reimbursement.name = vm.user.name;
                vm.reimbursement.employeeId = vm.user.employeeId;
            });
        }
        initController();
    };

    function TeamReimbursementsController(UserService, ReimbursementService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};

        /**Dummy  table data */

        // vm.empReimbursementData = [
        //     {
        //         "Name": "Nagaraju Kommanaboyina",
        //         "EmployeeID": "WL11274",
        //         "AppliedDate": "01-07-2020",
        //         "BusinessPurpose": "Client Meeting",
        //         "FromDate": "01-06-2020",
        //         "ToDate": "30-06-2020",
        //         "TotalAmount": "5000"
        //     },
        //     {
        //         "Name": "Nagaraju Kommanaboyina",
        //         "EmployeeID": "WL11274",
        //         "AppliedDate": "01-07-2020",
        //         "BusinessPurpose": "Client Meeting",
        //         "FromDate": "01-06-2020",
        //         "ToDate": "30-06-2020",
        //         "TotalAmount": "5000"
        //     },
        //     {
        //         "Name": "Nagaraju Kommanaboyina",
        //         "EmployeeID": "WL11274",
        //         "AppliedDate": "01-07-2020",
        //         "BusinessPurpose": "Client Meeting",
        //         "FromDate": "01-06-2020",
        //         "ToDate": "30-06-2020",
        //         "TotalAmount": "5000"
        //     },
        //     {
        //         "Name": "Nagaraju Kommanaboyina",
        //         "EmployeeID": "WL11274",
        //         "AppliedDate": "01-07-2020",
        //         "BusinessPurpose": "Client Meeting",
        //         "FromDate": "01-06-2020",
        //         "ToDate": "30-06-2020",
        //         "TotalAmount": "5000"
        //     }
        // ];

        function getMyReimbursements() {
            ReimbursementService.getMyReimbursements().then(function (response) {
                console.log("reimbursements", response);
                vm.teamReimbursements = response.reimbursements;
                console.log("vm.teamReimbursements", vm.teamReimbursements);
                for (var i = 0; i < vm.teamReimbursements.length; i++) {
                    vm.teamReimbursements[i].createdOn = JSON.stringify(vm.teamReimbursements[i].createdOn).split('T')[0].slice(1);
                }
            }, function (error) {
                console.log(error);
            });
        };

        vm.openTeamReimbursementModal = function (reimbursementId) {
            console.log("reimbursementId", reimbursementId);
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'reimbursement/teamReimbursementModal.html',
                controller: 'Reimbursement.TeamReimbursementsModalController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    reimbursementId: function () {
                        return reimbursementId;
                    }
                }
            });
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getMyReimbursements();
        }
        initController();
    };

    function TeamReimbursementsModalController(UserService, ReimbursementService, reimbursementId, _, $uibModal, $uibModalInstance, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.reimbursement = {
            items: []
        };
        vm.reimbursementId = reimbursementId;

        /**Dummy  table data */
        // vm.employeeReceiptData = [
        //     {
        //         "Date": "2020-01-06",
        //         "Category": "Fuel",
        //         "Cost": "1000",
        //         "Description": "Test Description",
        //         "Receipt": "Attachment"
        //     },
        //     {
        //         "Date": "2020-01-06",
        //         "Category": "Fuel",
        //         "Cost": "1000",
        //         "Description": "Test Description",
        //         "Receipt": "Attachment"
        //     },
        //     {
        //         "Date": "2020-01-06",
        //         "Category": "Fuel",
        //         "Cost": "1000",
        //         "Description": "Test Description",
        //         "Receipt": "Attachment"
        //     },
        //     {
        //         "Date": "2020-01-06",
        //         "Category": "Fuel",
        //         "Cost": "1000",
        //         "Description": "Test Description",
        //         "Receipt": "Attachment"
        //     }
        // ]


        function getMyReimbursementById() {
            ReimbursementService.getReimbursement(vm.reimbursementId).then(function (response) {
                console.log("response", response);
                vm.reimbursement = response.reimbursement;
                console.log("vm.reimbursement", vm.reimbursement);
                vm.reimbursement.createdOn = JSON.stringify(vm.reimbursement.createdOn).split('T')[0].slice(1);
                for (var i = 0; i < vm.reimbursement.items.length; i++) {
                    vm.reimbursement.items[i].billDate = JSON.stringify(vm.reimbursement.items[i].billDate).split('T')[0].slice(1);
                }
            }, function (error) {
                console.log(error);
            });
        };

        vm.validBill = function (index) {
            for (var i = 0; i < vm.reimbursement.items.length; i++) {
                if (i == index) {
                    vm.reimbursement.items[i].validBill = true;
                    vm.reimbursement.items[i].invalidBill = false;
                }
            }
        }
        vm.invalidBill = function (index) {
            for (var i = 0; i < vm.reimbursement.items.length; i++) {
                if (i == index) {
                    vm.reimbursement.items[i].validBill = false;
                    vm.reimbursement.items[i].invalidBill = true;
                }
            }
        }

        vm.accept = function (form, reimbursement) {
        };

        vm.reject = function () {
            $uibModalInstance.dismiss('cancel');
        };

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.reimbursement.name = vm.user.name;
                vm.reimbursement.id = vm.user.employeeId;
                vm.reimbursement.managerName = vm.user.projects[vm.user.projects.length - 1].ownerName;
                console.log("user", user);
            });
            getMyReimbursementById()
        }
        initController();
    };

})();
