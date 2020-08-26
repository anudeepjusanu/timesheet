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
        .controller('Reimbursement.AccountReimbursementsController', AccountReimbursementsController)
        .controller('Reimbursement.AccountReimbursementsModalController', AccountReimbursementsModalController)
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
        }])
        .filter('MyReceiptsSearch', function ($filter) {
            return function (input, searchObj) {
                var output = input;
                if (searchObj.category && searchObj.category.length > 0 && searchObj.category != "") {
                    output = $filter('filter')(output, function (item) {
                        return (item.receiptCategory == searchObj.category);
                    });
                }
                if (searchObj.status && searchObj.status.length > 0 && searchObj.status != "All") {
                    output = $filter('filter')(output, function (item) {
                        return (item.status == searchObj.status);
                    });
                }
                return output;
            }
        })
        .filter('ReimbursementsSearch', function ($filter) {
            return function (input, searchObj) {
                var output = input;
                if (searchObj.status && searchObj.status.length > 0 && searchObj.status != "All") {
                    output = $filter('filter')(output, function (item) {
                        return (item.status == searchObj.status);
                    });
                }
                return output;
            }
        });
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
        vm.searchObj = {
            status: 'All'
        };
        vm.reimbursementStatus = ReimbursementService.getReimbursementStatus();

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

    function ReimbursementFormController(UserService, $stateParams, ReimbursementService, noty, $timeout, _, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.approveUsers = [];
        vm.activeProjects = [];
        vm.alerts = [];
        vm.reimbursementObj = {
            project: null,
            status: "New",
            receipts: []
        };
        vm.receiptTotalAmount = 0;
        vm.reimbursementObj.receipts = $stateParams.receipts;
        vm.dateOptions = {
            datepickerMode: "month",
            minMode: 'month'
        }

        vm.calReceiptsAmount = function () {
            vm.receiptTotalAmount = 0;
            vm.receiptApprovedTotalAmount = 0;
            _.each(vm.reimbursementObj.receipts, (receiptObj) => {
                vm.receiptTotalAmount += parseFloat(receiptObj.receiptAmount);
                vm.receiptApprovedTotalAmount += parseFloat(receiptObj.approvedAmount);
            });
            vm.reimbursementObj.totalAmount = vm.receiptTotalAmount.toFixed(2);
        }

        vm.getApproveActiveUsersList = function () {
            ReimbursementService.getApproveUsersList().then(function (response) {
                vm.approveActiveUsers = response.users;
                vm.getActiveProjectsList();
            }, function (error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.getActiveProjectsList = function () {
            ReimbursementService.getActiveProjectsList().then(function (response) {
                vm.activeProjects = response.projects;
                vm.getReimbursementById();
            }, function (error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.getReimbursementById = function () {
            if ($stateParams.reimbursementId) {
                ReimbursementService.getReimbursement($stateParams.reimbursementId).then(function (response) {
                    vm.reimbursementObj = response.reimbursement;
                    vm.reimbursementObj.reimbursementMonth = new Date(vm.reimbursementObj.reimbursementMonth);
                    vm.reimbursementObj.project = _.find(vm.activeProjects, { _id: vm.reimbursementObj.projectId });
                    _.each(vm.reimbursementObj.receipts, (receiptObj) => {
                        receiptObj.receiptDate = String(receiptObj.receiptDate).split("T")[0];
                    });
                    //vm.calReceiptsAmount();
                }, function (error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                });
            }
        }

        vm.submitReimbursement = function (reimbursementForm, reimbursementObj) {
            if (reimbursementForm.$valid) {
                var formData = {};
                formData.reimbursementMonth = $filter('date')(reimbursementObj.reimbursementMonth, "yyyy-MM-dd");
                formData.approveUserId = reimbursementObj.approveUserId;
                formData.projectId = reimbursementObj.projectId;
                formData.purpose = reimbursementObj.purpose;
                formData.status = 'Submitted';
                formData.receipts = [];
                _.each(reimbursementObj.receipts, function (receiptObj) {
                    formData.receipts.push(receiptObj._id);
                });

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

        vm.changeProject = function () {
            if (vm.reimbursementObj.project) {
                console.log(vm.reimbursementObj.project);
                vm.reimbursementObj.projectId = vm.reimbursementObj.project._id;
                vm.reimbursementObj.approveUserId = (vm.reimbursementObj.project.reimbursementApproverId) ? vm.reimbursementObj.project.reimbursementApproverId : vm.reimbursementObj.project.ownerId;
            }
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                if ($stateParams.reimbursementId) {
                    vm.isReimbursementFormEdit = true;
                } else {
                    vm.reimbursementObj.userName = vm.user.name;
                    vm.isReimbursementFormEdit = false;
                    if (vm.reimbursementObj.receipts.length == 0) {
                        $state.go('myReceipts');
                    }
                }
            });
            vm.getApproveActiveUsersList();
            vm.calReceiptsAmount();
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
            receiptFormData.append('receiptNumber', receiptData.receiptNumber);
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

    function TeamReimbursementsController(UserService, ReimbursementService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.reimbursements = [];
        vm.searchObj = {
            status: "Submitted"
        }
        vm.reimbursementStatus = ReimbursementService.getReimbursementStatus();

        function getTeamReimbursements() {
            ReimbursementService.getTeamReimbursements().then(function (response) {
                vm.reimbursements = response.reimbursements;
                _.each(vm.reimbursements, function (item) {
                    item.createdOn = $filter('date')(item.createdOn, "yyyy-MM-dd");
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.openTeamReimbursementModal = function (reimbursementObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'reimbursement/teamReimbursementModal.html',
                controller: 'Reimbursement.TeamReimbursementsModalController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    userObj: function () {
                        return vm.user;
                    },
                    reimbursementObj: function () {
                        return reimbursementObj;
                    }
                }
            }).result.then(function () {
                getTeamReimbursements();
            }, function () {
                getTeamReimbursements();
            });
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getTeamReimbursements();
        }
        initController();
    };

    function AccountReimbursementsController(UserService, ReimbursementService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.reimbursements = [];
        vm.searchObj = {
            status: "Approved"
        }
        vm.reimbursementStatus = ReimbursementService.getReimbursementStatus();

        function getAccountReimbursements() {
            ReimbursementService.getAccountReimbursements().then(function (response) {
                vm.reimbursements = response.reimbursements;
                _.each(vm.reimbursements, function (item) {
                    item.createdOn = $filter('date')(item.createdOn, "yyyy-MM-dd");
                });
            }, function (error) {
                console.log(error);
            });
        };

        vm.openAccountReimbursementModal = function (reimbursementObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'reimbursement/teamReimbursementModal.html',
                controller: 'Reimbursement.AccountReimbursementsModalController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    userObj: function () {
                        return vm.user;
                    },
                    reimbursementObj: function () {
                        return reimbursementObj;
                    }
                }
            }).result.then(function () {
                getAccountReimbursements();
            }, function () {
                getAccountReimbursements();
            });
        }

        vm.paymentProcessReimbursement = function (reimbursementObj) {
            $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'reimbursement/paymentReimbursementModal.html',
                controller: function (UserService, ReimbursementService, reimbursementObj, userObj, $uibModalInstance) {
                    var vm = this;
                    vm.user = userObj;
                    vm.alerts = [];
                    vm.reimbursement = reimbursementObj;

                    vm.paymentProcessReimbursement = function () {
                        var objData = {
                            receipts: vm.reimbursement.receipts,
                            paidDate: vm.reimbursement.paidDate,
                            paymentMode: vm.reimbursement.paymentMode,
                            comment: vm.reimbursement.comment
                        }
                        ReimbursementService.paymentProcessReimbursement(vm.reimbursement._id, objData).then(function (response) {
                            $uibModalInstance.dismiss('close');
                        }, function (error) {
                            console.log(error);
                        });
                    }

                    vm.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    }

                    vm.closeAlert = function (index) {
                        vm.alerts.splice(index, 1);
                    }

                    function initController() {
                        UserService.GetCurrent().then(function (user) {
                            vm.user = user;
                        });
                    }
                    initController();
                },
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    userObj: function () {
                        return vm.user;
                    },
                    reimbursementObj: function () {
                        return reimbursementObj;
                    }
                }
            }).result.then(function () {
                getAccountReimbursements();
            }, function () {
                getAccountReimbursements();
            });
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getAccountReimbursements();
        }
        initController();
    };

    function TeamReimbursementsModalController(UserService, ReimbursementService, reimbursementObj, _, $scope, $uibModal, $uibModalInstance, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.reimbursement = reimbursementObj;

        if (vm.reimbursement.status == "Submitted") {
            _.each(vm.reimbursement.receipts, function (receiptObj) {
                receiptObj.approvedAmount = receiptObj.receiptAmount;
            });
        }

        vm.approveReimbursement = function () {
            ReimbursementService.approveReimbursement(vm.reimbursement._id, vm.reimbursement).then(function (response) {
                $uibModalInstance.dismiss('close');
            }, function (error) {
                console.log(error);
            });
        }

        vm.rejectReimbursement = function () {
            ReimbursementService.rejectReimbursement(vm.reimbursement._id, { comment: vm.reimbursement.comment }).then(function (response) {
                $uibModalInstance.dismiss('close');
            }, function (error) {
                console.log(error);
            });
        }

        vm.calReceiptsAmount = function () {
            vm.reimbursement.approvedAmount = 0;
            _.each(vm.reimbursement.receipts, function (receiptObj) {
                vm.reimbursement.approvedAmount += parseFloat(receiptObj.approvedAmount);
            });
            vm.reimbursement.totalAmount = vm.reimbursement.approvedAmount.toFixed(2);
        }

        vm.close = function () {
            $uibModalInstance.dismiss('cancel');
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.calReceiptsAmount();
            });
        }
        initController();
    };

    function AccountReimbursementsModalController(UserService, ReimbursementService, reimbursementObj, _, $uibModal, $uibModalInstance, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.reimbursement = reimbursementObj;
        vm.enablePayBtn = false;
        vm.enableRejectBtn = false;

        vm.approveReimbursementReceipt = function (receipt) {
            ReimbursementService.approveReimbursementReceipt(receipt._id).then(function (response) {
                receipt.status = "Approved";
                vm.checkReimbursementStatus();
            }, function (error) {
                console.log(error);
            });
        }

        vm.rejectReimbursementReceipt = function (receipt) {
            ReimbursementService.rejectReimbursementReceipt(receipt._id).then(function (response) {
                receipt.status = "Rejected";
                vm.checkReimbursementStatus();
            }, function (error) {
                console.log(error);
            });
        }

        vm.expensesApproveReimbursement = function (form) {
            if (form.$valid) {
                var objData = {
                    //paidDate: $filter('date')(vm.reimbursement.paidDate, "yyyy-MM-dd"),
                    //paymentMode: vm.reimbursement.paymentMode,
                    comment: vm.reimbursement.comment
                };
                ReimbursementService.expensesApproveReimbursement(vm.reimbursement._id, objData).then(function (response) {
                    $uibModalInstance.dismiss('close');
                }, function (error) {
                    console.log(error);
                });
            } else {
                vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            }
        }

        vm.expencesRejectReimbursement = function () {
            var objData = {
                comment: vm.reimbursement.comment
            };
            ReimbursementService.expencesRejectReimbursement(vm.reimbursement._id, objData).then(function (response) {
                $uibModalInstance.dismiss('close');
            }, function (error) {
                console.log(error);
            });
        }

        vm.checkReimbursementStatus = function () {
            vm.enablePayBtn = true;
            _.each(vm.reimbursement.receipts, function (receiptObj) {
                if (receiptObj.status != "Approved") {
                    vm.enablePayBtn = false;
                }
            });
        }

        vm.close = function () {
            $uibModalInstance.dismiss('cancel');
        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.checkReimbursementStatus();
            });
        }
        initController();
    };

})();
