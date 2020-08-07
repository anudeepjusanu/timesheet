(function () {
    'use strict';

    angular
        .module('app')
        .controller('Reimbursement.IndexController', MyReimbursementsController)
        .controller('Reimbursement.ReimbursementFormController', ReimbursementFormController)
        .controller('Reimbursement.MyReceiptsController', MyReceiptsController)
        .controller('Reimbursement.ReceiptFormController', ReceiptFormController)
        .controller('Reimbursement.TeamReimbursementsController', TeamReimbursementsController)
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
        vm.alerts = [];

        function getMyReimbursements() {
            ReimbursementService.getMyReimbursements().then(function (response) {
                console.log("reimbursements", response);
                vm.reimbursements = response.reimbursements;
                for (var i = 0; i < vm.reimbursements.length; i++) {
                    vm.reimbursements[i].createdOn = $filter('date')(vm.reimbursements[i].createdOn, "yyyy-MM-ddTHH:mm:ss");
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

    function ReimbursementFormController(UserService, $stateParams, $scope, ReimbursementService, noty, $timeout, _, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.approveUsers = [];
        vm.alerts = [];
        vm.categories = ReimbursementService.getReimbursementCategories();
        vm.reimbursementObj = {
            items: []
        };

        vm.getApproveActiveUsersList = function () {
            ReimbursementService.getApproveUsersList().then(function (response) {
                vm.approveActiveUsers = response.users;
                console.log("vm.approveActiveUsers", vm.approveActiveUsers);
            }, function (error) {
                if (error) {
                    vm.alerts.push({ msg: error, type: 'danger' });
                }
            });
        }

        vm.addBill = function (index, user) {
            if (!vm.reimbursementObj.items) {
                vm.reimbursementObj.items = [];
            }
            vm.reimbursementObj.items.push({ "file": vm.myFile });
        }

        vm.deleteBill = function (billDate, index) {
            vm.reimbursementObj.items.splice(index, 1);
        }

        vm.submitReimbursement = function (reimbursementForm, reimbursementObj, index) {
            var reimbursementFrom = $filter('date')(reimbursementObj.reimbursementFrom, "yyyy-MM-dd");
            var reimbursementTo = $filter('date')(reimbursementObj.reimbursementTo, "yyyy-MM-dd");
            var formData = new FormData();
            formData.append('approveUserId', reimbursementObj.projectId);
            formData.append('reimbursementFrom', reimbursementFrom);
            formData.append('reimbursementTo', reimbursementTo);
            formData.append('purpose', reimbursementObj.purpose);
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
                        console.log(response.reimbursement);
                        if (response.reimbursement) {
                            _.each(reimbursementObj.items, function (itemData) {
                                vm.saveReimbursementItem(itemData, response.reimbursement._id);
                            });
                        }
                        noty.showSuccess("Reimbursement has been added successfully!");
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

        vm.saveReimbursementItem = function (itemData, reimbursementId, itemIndex) {
            var itemFormData = new FormData();
            itemFormData.append('file', itemData.file);
            itemFormData.append('billDate', itemData.billDate);
            itemFormData.append('billCategory', itemData.billCategory);
            itemFormData.append('billAmount', itemData.billAmount);
            itemFormData.append('billDescription', itemData.billDescription);
            if (itemData._id) {
                ReimbursementService.updateReimbursementItem(itemData._id, itemFormData).then(function (response) {
                    noty.showSuccess("Reimbursement bill item has been updated successfully!");
                }, function (error) {
                    if (error) {
                        vm.alerts.push({ msg: error, type: 'danger' });
                    }
                });
            } else {
                ReimbursementService.addReimbursementItem(reimbursementId, itemFormData).then(function (response) {
                    noty.showSuccess("Reimbursement bill item has been updated successfully!");
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

    function MyReceiptsController(UserService, ReimbursementService, _, $uibModal, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.receipts = [];
        vm.selected = [];

        function getMyReceipts() {
            ReimbursementService.getMyReceipts().then(function (response) {
                vm.receipts = response.receipts;
                for (var i = 0; i < vm.receipts.length; i++) {
                    vm.receipts[i].selected = false;
                    vm.receipts[i].createdOn = $filter('date')(vm.receipts[i].createdOn, "yyyy-MM-ddTHH:mm:ss");
                }
            }, function (error) {
                console.log(error);
            });
        };

        vm.addReimbursement = function () {

        }

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getMyReceipts();
        }
        initController();
    };

    function ReceiptFormController(UserService, $stateParams, $state, ReimbursementService, noty, _, $filter) {
        var vm = this;
        vm.user = {};
        vm.alerts = [];
        vm.categories = ReimbursementService.getReimbursementCategories();
        vm.receiptObj = {
        };

        vm.saveReceipt = function (receiptForm, receiptData) {
            var receiptFormData = new FormData();
            receiptFormData.append('file', receiptData.file);
            receiptFormData.append('receiptDate', receiptData.receiptDate);
            receiptFormData.append('receiptCategory', receiptData.receiptCategory);
            receiptFormData.append('receiptAmount', receiptData.receiptAmount);
            receiptFormData.append('receiptDescription', receiptData.receiptDescription);
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
                    noty.showSuccess("Receipt has been updated successfully!");
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
            if ($stateParams.receiptId) {
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

        function getMyReimbursements() {
            ReimbursementService.getMyReimbursements().then(function (response) {
                vm.teamReimbursements = response.reimbursements;
                console.log("vm.teamReimbursements", vm.teamReimbursements);
                for (var i = 0; i < vm.teamReimbursements.length; i++) {
                    vm.teamReimbursements[i].createdOn = $filter('date')(vm.teamReimbursements[i].createdOn, "yyyy-MM-ddTHH:mm:ss");
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
                console.log("response", response);
                vm.reimbursement = response.reimbursement;
                console.log("vm.reimbursement", vm.reimbursement);
                vm.reimbursement.createdOn = $filter('date')(vm.reimbursement.createdOn, "yyyy-MM-ddTHH:mm:ss");
                for (var i = 0; i < vm.reimbursement.items.length; i++) {
                    vm.reimbursement.items[i].receiptDate = $filter('date')(vm.reimbursement.items[i].receiptDate, "yyyy-MM-dd");
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

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        }

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
