(function () {
    'use strict';

    angular
        .module('app')
        .controller('Reimbursement.IndexController', IndexController)
        .controller('Reimbursement.MyReimbursementsController', MyReimbursementsController)
        .controller('Reimbursement.ReimbursementFormController', ReimbursementFormController)
        .controller('Reimbursement.MyReceiptsController', MyReceiptsController)
        .controller('Reimbursement.ReceiptFormController', ReceiptFormController)
        .controller('Reimbursement.TeamReimbursementsController', TeamReimbursementsController)
        .controller('Reimbursement.TeamReimbursementsModalController', TeamReimbursementsModalController)
        .controller('Reimbursement.MyReimbursementStatusController', MyReimbursementStatusController)
        .controller('Reimbursement.AccountReimbursementsController', AccountReimbursementsController)
        /**Directive to handle the file */
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
    function IndexController(UserService, ReimbursementService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
        initController();
    };
    /** Controller to handle all the employee reimbursements*/
    function MyReimbursementsController(UserService, ReimbursementService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];

        function getMyReimbursements() {
            ReimbursementService.getMyReimbursements().then(function (response) {
                vm.reimbursements = response.reimbursements;
                _.each(vm.reimbursements, function (item) {
                    item.createdOn = $filter('date')(item.createdOn, "yyyy-MM-dd");
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.delReimbursement = function (reimbursementObj) {
            if (confirm("Do you want to delete this reimbursement ?")) {
                ReimbursementService.deleteReimbursement(reimbursementObj._id).then(function (response) {
                    getMyReimbursements();
                }, function (error) {
                    console.log(error);
                    getMyReimbursements();
                });
            }
        }

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

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
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

    /**Controller to handle the Employee reibursement form */
    function ReimbursementFormController(UserService, $stateParams, ReimbursementService, noty, $timeout, _, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.approveUsers = [];
        vm.alerts = [];
        vm.categories = ReimbursementService.getReimbursementCategories();
        vm.reimbursementObj = {
            receipts: []
        };
        vm.reimbursementObj.receipts = $stateParams.receipts;

        vm.getApproveActiveUsersList = function () {
            ReimbursementService.getApproveUsersList().then(function (response) {
                vm.approveActiveUsers = response.users;
            }, function (error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        // vm.addBill = function (index, user) {
        //     if (!vm.reimbursementObj.items) {
        //         vm.reimbursementObj.items = [];
        //     }
        //     vm.reimbursementObj.items.push({ "file": vm.myFile });
        // }

        // vm.deleteBill = function (billDate, index) {
        //     vm.reimbursementObj.items.splice(index, 1);
        // }

        vm.submitReimbursement = function (reimbursementForm, reimbursementObj, index) {
            var formData = {};
            formData.reimbursementFrom = $filter('date')(reimbursementObj.reimbursementFrom, "yyyy-MM-dd");
            formData.reimbursementTo = $filter('date')(reimbursementObj.reimbursementTo, "yyyy-MM-dd");
            formData.approveUserId = reimbursementObj.approveUserId;
            formData.department = reimbursementObj.department;
            formData.purpose = reimbursementObj.purpose;
            formData.status = 'Submitted';
            formData.receipts = [];
            _.each(reimbursementObj.receipts, function (receiptObj) {
                formData.receipts.push(receiptObj._id);
            });
            if (reimbursementForm.$valid) {
                if (reimbursementObj._id) {
                    ReimbursementService.updateReimbursement(reimbursementObj._id, formData).then(function (response) {
                        noty.showSuccess("Reimbursement has been updated successfully!");
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                } else {
                    ReimbursementService.addReimbursement(formData).then(function (response) {
                        if (response.reimbursement) {
                            _.each(reimbursementObj.items, function (itemData) {
                                vm.saveReimbursementItem(itemData, response.reimbursement._id);
                            });
                        }
                        noty.showSuccess("Reimbursement has been added successfully!");
                        $state.go('myReimbursements');
                    }, function (error) {
                        if (error) {
                            vm.alerts.push({ msg: error, type: 'danger' });
                        }
                    });
                }
            } else {
                vm.alerts.push({ msg: "Please enter valid data", type: 'danger' });
            }
        };

        // vm.saveReimbursementItem = function (itemData, reimbursementId, itemIndex) {
        //     var itemFormData = new FormData();
        //     itemFormData.append('file', itemData.file);
        //     itemFormData.append('billDate', itemData.billDate);
        //     itemFormData.append('billCategory', itemData.billCategory);
        //     itemFormData.append('billAmount', itemData.billAmount);
        //     itemFormData.append('billDescription', itemData.billDescription);
        //     if (itemData._id) {
        //         ReimbursementService.updateReimbursementItem(itemData._id, itemFormData).then(function (response) {
        //             noty.showSuccess("Reimbursement bill item has been updated successfully!");
        //         }, function (error) {
        //             if (error) {
        //                 vm.alerts.push({ msg: error, type: 'danger' });
        //             }
        //         });
        //     } else {
        //         ReimbursementService.addReimbursementItem(reimbursementId, itemFormData).then(function (response) {
        //             noty.showSuccess("Reimbursement bill item has been updated successfully!");
        //         }, function (error) {
        //             if (error) {
        //                 vm.alerts.push({ msg: error, type: 'danger' });
        //             }
        //         });
        //     }
        // }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.reimbursementObj.name = vm.user.name;
            });
            if ($stateParams.reimbursementId) {
                vm.isReimbursementFormEdit = true;
            } else {
                vm.isReimbursementFormEdit = false;
            }
            ReimbursementService.getApproveUsersList().then(function (response) {
                if (response.users) {
                    vm.approveUsers = response.users;
                }
            });
            vm.getApproveActiveUsersList();
        }
        initController();
    };

    /**Controller to handle all employee receipts */
    function MyReceiptsController(UserService, ReimbursementService, $scope, $rootScope, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.receipts = [];
        vm.selected = [];
        vm.selectAll = false;

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
        /**Delete function to open Model */
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

        /** Function to enable the Submit Reimbursement button*/
        vm.enableSubmitButton = function (selectedBills) {
            vm.selectedBillsIndex = 0;
            if (_.find(selectedBills, function (obj) { return obj.selected; })) {
                vm.enableSubmitReimbursementBtn = true;
            } else {
                vm.enableSubmitReimbursementBtn = false;
            }
            _.each(selectedBills, function (item) {
                if (item.selected) {
                    vm.selectedBillsIndex = vm.selectedBillsIndex + 1;
                }
            })
        }

        vm.checkAll = function () {
            _.each(vm.receipts, function (receipt) {
                receipt.selected = vm.selectAll;
            });
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

    /**Modal Controller to delete the receipt */
    function DeleteReceiptModalController(UserService, ReimbursementService, $rootScope, $scope, $uibModalInstance, receiptId, noty, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        var receiptId = receiptId;

        vm.confirmDeleteReceipt = function () {
            if (receiptId) {
                ReimbursementService.deleteReimbursementReceipt(receiptId).then(function (response) {
                    noty.showSuccess("Receipt has been deleted successfully!");
                    $rootScope.$emit("GetMyReceipts", {});
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

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
        initController();
    };

    /**Controller to handle the Receipt form */
    function ReceiptFormController(UserService, $stateParams, $state, ReimbursementService, noty, _, $filter) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.receiptObj = {};
        vm.categories = ReimbursementService.getReimbursementCategories();
        if ($stateParams.receipt._id) {
            $stateParams.receipt.receiptDate = new Date($stateParams.receipt.receiptDate)
            vm.receiptObj = $stateParams.receipt;
        } else {
            vm.receiptObj = {};
        }

        vm.saveReceipt = function (receiptForm, receiptData) {
            var receiptFormData = new FormData();
            receiptFormData.append('file', receiptData.file);
            receiptFormData.append('receiptDate', receiptData.receiptDate);
            if (receiptData.receiptCategory) {
                receiptFormData.append('receiptCategory', receiptData.receiptCategory);
            }
            receiptFormData.append('receiptAmount', receiptData.receiptAmount);
            if (receiptData.receiptDescription) {
                receiptFormData.append('receiptDescription', receiptData.receiptDescription);
            }
            if (receiptData._id) {
                ReimbursementService.updateReimbursementReceipt(receiptData._id, receiptFormData).then(function (response) {
                    noty.showSuccess("Receipt has been updated successfully!");
                    $state.go('myReceipts');
                }, function (error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                });
            } else {
                ReimbursementService.addReimbursementReceipt(receiptFormData).then(function (response) {
                    noty.showSuccess("Receipt has been added successfully!");
                    $state.go('myReceipts');
                }, function (error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                });
            }
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            if ($stateParams.receipt._id) {
                vm.isReceiptFormEdit = true;
            } else {
                vm.isReceiptFormEdit = false;
            }
        }
        initController();
    };

    /**Controller to handle all the employee reimbursements for Manges or lead or admin */
    function TeamReimbursementsController(UserService, ReimbursementService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];

        function getPendingReimbursements() {
            ReimbursementService.getPendingReimbursements().then(function (response) {
                vm.teamReimbursements = response.reimbursements;
                _.each(vm.teamReimbursements, function (item) {
                    item.createdOn = $filter('date')(item.createdOn, "yyyy-MM-dd");
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.openTeamReimbursementModal = function (reimbursementId) {
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

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getPendingReimbursements();
        }
        initController();
    };

    function AccountReimbursementsController(UserService, ReimbursementService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];

        function getPendingReimbursements() {
            ReimbursementService.getPendingReimbursements().then(function (response) {
                vm.teamReimbursements = response.reimbursements;
                _.each(vm.teamReimbursements, function (item) {
                    item.createdOn = $filter('date')(item.createdOn, "yyyy-MM-dd");
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.openTeamReimbursementModal = function (reimbursementId) {
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

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getPendingReimbursements();
        }
        initController();
    };

    /**Controller to handle the  employee reimbursement form for manager or lead or admin*/
    function TeamReimbursementsModalController(UserService, ReimbursementService, reimbursementId, _, $uibModal, $uibModalInstance, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.reimbursement = {
            items: []
        };
        vm.reimbursementId = reimbursementId;

        function getMyReimbursementById() {
            ReimbursementService.getReimbursement(vm.reimbursementId).then(function (response) {
                vm.reimbursement = response.reimbursement;
                vm.reimbursement.createdOn = $filter('date')(vm.reimbursement.createdOn, "yyyy-MM-ddTHH:mm:ss");
                _.each(vm.reimbursement.items, function (item) {
                    item.billDate = $filter('date')(item.billDate, "yyyy-MM-dd");
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.acceptReceipt = function (receiptIndex) {
            _.each(vm.reimbursement.items, function (item, index) {
                if (receiptIndex == index) {
                    item.acceptReceipt = true;
                    item.rejectReceipt = false;
                }
            });
        }
        vm.rejectReceipt = function (receiptIndex) {
            _.each(vm.reimbursement.items, function (item, index) {
                if (receiptIndex == index) {
                    item.acceptReceipt = false;
                    item.rejectReceipt = true;
                }
            });
        }

        vm.acceptAllReceipts = function () {
            _.each(vm.reimbursement.items, function (item) {
                item.acceptReceipt = true;
                item.rejectReceipt = false;
            });
        }

        vm.rejectAllReceipts = function () {
            _.each(vm.reimbursement.items, function (item) {
                item.acceptReceipt = false;
                item.rejectReceipt = true;
            });
        }

        vm.accept = function (form, reimbursement) {

        };

        vm.reject = function () {

        };

        vm.close = function () {
            $uibModalInstance.dismiss('cancel');
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.reimbursement.name = vm.user.name;
                vm.reimbursement.id = vm.user.employeeId;
            });
            getMyReimbursementById()
        }
        initController();
    };

})();
