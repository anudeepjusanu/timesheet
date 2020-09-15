(function () {
    'use strict';

    angular
        .module('app')
        .controller('JobOpenings.ManageJobOpeningsController', ManageJobOpeningsController)
        .controller('JobOpenings.JobOpeningFormController', JobOpeningFormController)
        .filter('MyReceiptsSearch', function ($filter) {
            return function (input, searchObj) {
                var output = input;
                if (searchObj.category && searchObj.category.length > 0 && searchObj.category != "") {
                    output = $filter('filter')(output, function (item) {
                        return (item.receiptCategory == searchObj.category);
                    });
                }
                return output;
            }
        });
    function ManageJobOpeningsController(UserService, ReimbursementService, $scope, $rootScope, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.receipts = [];
        vm.selected = [];
        vm.selectAll = false;
        vm.categories = ReimbursementService.getReimbursementCategories();
        vm.searchObj = {
            category: "",
            status: "New"
        };
        vm.categories.unshift({ "categoryTypeId": "", "categoryTypeVal": "All" });

        $rootScope.$on("GetMyReceipts", function () {
            $scope.getMyReceipts();
        });

        /**Function to get all the employee receipts */
        $scope.getMyReceipts = function () {
            ReimbursementService.getMyReceipts().then(function (response) {
                vm.receipts = response.receipts;
                _.each(vm.receipts, function (receipt) {
                    receipt.selected = false;
                    receipt.receiptDate = $filter('date')(receipt.receiptDate, "yyyy-MM-dd");
                    receipt.receiptAmount = receipt.receiptAmount.toFixed(2);
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.addReimbursement = function (selectedReceipts) {
            _.each(selectedReceipts, function (selectedReceipt) {
                if (selectedReceipt.selected) {
                    vm.selected.push(selectedReceipt);
                }
            });
            $state.go('reimbursementForm', {
                receipts: vm.selected
            })
        }

        vm.editReceipt = function (receipt) {
            $state.go('receiptForm', {
                receipt: receipt
            })
        }

        vm.deleteReceipt = function (receiptId) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'common/modalConfirm.html',
                controller: function (ReimbursementService, $uibModalInstance, receiptId, noty, _) {
                    var vm = this;
                    vm.confirmTitle = "Delete Receipt";
                    vm.confirmMessage = "Are you sure, do you want to delete the receipt?";

                    vm.confirmOk = function () {
                        if (receiptId) {
                            ReimbursementService.deleteReimbursementReceipt(receiptId).then(function (response) {
                                noty.showSuccess("Receipt has been deleted successfully!");
                            }, function (error) {
                                if (error) {
                                    vm.alerts.push({ msg: error, type: 'danger' });
                                }
                            });
                        }
                        $uibModalInstance.dismiss('cancel');
                    }

                    vm.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    receiptId: function () {
                        return receiptId;
                    }
                },
                controllerAs: 'vm',
                size: 'xs'
            }).result.then(function (obj) {
                //vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
                $scope.getMyReceipts();
            }, function () {
                $scope.getMyReceipts();
            });
        }

        vm.enableSubmitButton = function () {
            vm.enableSubmitReimbursementBtn = false;
            _.each(vm.receipts, function (receiptObj) {
                if (receiptObj.selected === true) {
                    vm.enableSubmitReimbursementBtn = true;
                }
            });
        }

        vm.checkAll = function () {
            _.each(vm.receipts, function (receipt) {
                if (receipt.status == "New") {
                    receipt.selected = vm.selectAll;
                }
            });
            vm.enableSubmitButton();
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            $scope.getMyReceipts();
        }

        initController();
    };

    function JobOpeningFormController(UserService, $scope, _) {
        var vm = this;
        vm.user = {};


        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
        initController();
    };

})();
