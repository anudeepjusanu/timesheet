(function () {
    'use strict';

    angular
        .module('app')
        .controller('Reimbursement.IndexController', MyReimbursementsController)
        .controller('Reimbursement.TeamReimbursementsController', TeamReimbursementsController)
        .controller('Reimbursement.AddMyReimbursementController', AddMyReimbursementController)
        .controller('Reimbursement.TeamReimbursementsModalController', TeamReimbursementsModalController)
        .controller('Reimbursement.MyReimbursementStatusController', MyReimbursementStatusController)
        .directive('fileDirective', FileDirective) //Directive to handel file
        .service('fileUploadService', FileUploadService) //Service to handle file

    /**File Upload Directive */
    function FileDirective($parse) {
        return {
            restrict: 'A', //the directive can be used as an attribute only
            /**
                link is a function that defines functionality of directive
                scope: scope associated with the element
                element: element on which this directive used
                attrs: key value pair of element attributes
             */
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileDirective),
                    modelSetter = model.assign; //define a setter for fileDirective

                //Bind change event on the element
                element.bind('change', function () {
                    //Call apply on scope, it checks for value changes and reflect them on UI
                    scope.$apply(function () {
                        //set the model value
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }

    /**Reference Service to File UPLOAD */
    function FileUploadService($http, $q) {
        // uploadFileToUrl = function(file, uploadUrl) {
        uploadFileToUrl = function (file, uploadUrl) {
            //FormData, object of key/value pair for form fields and values
            var fileFormData = new FormData();
            fileFormData.append('file', file);

            var deffered = $q.defer();
            $http.post(uploadUrl, fileFormData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }

            }).success(function (response) {
                deffered.resolve(response);

            }).error(function (response) {
                deffered.reject(response);
            });

            return deffered.promise;
        }
        //  }
    }

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

    function AddMyReimbursementController(UserService, $scope, ReimbursementService, $timeout, _, $filter, $state) {
        var vm = this;
        vm.user = {};
        vm.categories = [
            { "categoryTypeId": "Business Cards", "categoryTypeVal": "Business Cards" },
            { "categoryTypeId": "Business Meals", "categoryTypeVal": "Business Meals" },
            { "categoryTypeId": "Dues", "categoryTypeVal": "Dues" },
            { "categoryTypeId": "Legal Fees", "categoryTypeVal": "Legal Fees" },
            { "categoryTypeId": "License Fees", "categoryTypeVal": "License Fees" },
            { "categoryTypeId": "Mileage", "categoryTypeVal": "Mileage" },
            { "categoryTypeId": "Office Supplies", "categoryTypeVal": "Office Supplies" },
            { "categoryTypeId": "Passport fee", "categoryTypeVal": "Passport fee" },
            { "categoryTypeId": "Postage", "categoryTypeVal": "Postage" },
            { "categoryTypeId": "Printer Cartridges", "categoryTypeVal": "Printer Cartridges" },
            { "categoryTypeId": "Printer Paper", "categoryTypeVal": "Printer Paper" },
            { "categoryTypeId": "Software", "categoryTypeVal": "Software" },
            { "categoryTypeId": "Stationery", "categoryTypeVal": "Stationery" },
            { "categoryTypeId": "Subscriptions", "categoryTypeVal": "Subscriptions" },
            { "categoryTypeId": "Telephones", "categoryTypeVal": "Telephones" },
            { "categoryTypeId": "Tools", "categoryTypeVal": "Tools" },
            { "categoryTypeId": "Training Fees", "categoryTypeVal": "Training Fees" },
            { "categoryTypeId": "Travel", "categoryTypeVal": "Travel" },
            { "categoryTypeId": "Work Clothing", "categoryTypeVal": "Work Clothing" },
            { "categoryTypeId": "Other", "categoryTypeVal": "Other" }
        ];
        vm.myReimbursementsObj = {
            items: []
        };

        vm.changeManager = function (projectID) {
            console.log("projectID", projectID);
            vm.myReimbursementsObj.managerName = vm.user.projects.find(obj => obj.projectId == projectID).ownerName;
        }

        vm.addBillDate = function (index, user) {
            if (!vm.myReimbursementsObj.items) {
                vm.myReimbursementsObj.items = [];
            }
            vm.myReimbursementsObj.items.push({ "file": vm.myFile });
        }

        vm.deleteBillDate = function (billDate, index) {
            vm.myReimbursementsObj.items.splice(index, 1);
        }

        $scope.uploadFile = function (index) {
            console.log("index", index, vm.myReimbursementsObj.items);
            for (var i = 0; i < vm.myReimbursementsObj.items.length; i++) {
                console.log("vm.myReimbursementsObj.items[index]", vm.myReimbursementsObj.items[index])
                vm.myReimbursementsObj.items[index].file = vm.myFile;

            }
            /**Reference to File Handling **/
            var file = vm.myFile;
            console.log("file", file)
            // var uploadUrl = "../server/service.php", //Url of webservice/api/server
            //     promise = FileUploadService.uploadFileToUrl(file, uploadUrl);

            // promise.then(function (response) {
            //     $scope.serverResponse = response;
            // }, function () {
            //     $scope.serverResponse = 'An error has occurred';
            // })
            var fileFormData = new FormData();
            fileFormData.append('file', file);
            fileFormData.append('billDate', "2020-06-01");
            fileFormData.append('billCategory', "Business Meals");
            fileFormData.append('billAmount', '5000');
            fileFormData.append('billDescription', 'Test Description');
            for (let [name, value] of fileFormData) {
                console.log(`${name} = ${value}`); // key1=value1, then key2=value2
            }
            var reimbursementId = '5f27c557517e74bf473d8fcc'

            console.log("fileFormData", fileFormData);
            console.log('formData.get(file)', fileFormData.get(file));
            ReimbursementService.addReimbursement(reimbursementId, fileFormData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }

            }).then(function (response) {
                console.log("reimbursement", response);
                vm.reimbursement = response.reimbursement;
            }, function (error) {
                console.log(error);
            });


            /**Reference to File handling code */
            // file.upload = Upload.upload({
            //     url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
            //     data: { username: receipt.billDate, file: file },
            // });

            // file.upload.then(function (response) {
            //     $timeout(function () {
            //         file.result = response.data;
            //         console.log("file.result", file.result)
            //     });
            // }, function (response) {
            //     if (response.status > 0)
            //         $scope.errorMsg = response.status + ': ' + response.data;
            // }, function (evt) {
            //     // Math.min is to fix IE which reports 200% sometimes
            //     file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            // });

            /** End of File Handling **/
        };

        /**To save Reimbursement data */
        vm.save = function (form, myReimbursementsObj, index) {
            console.log('myReimbursementsObj', myReimbursementsObj);
            console.log("data", JSON.stringify(myReimbursementsObj));
            myReimbursementsObj.fromDate = JSON.stringify(myReimbursementsObj.fromDate).split('T')[0].slice(1);
            myReimbursementsObj.toDate = JSON.stringify(myReimbursementsObj.toDate).split('T')[0].slice(1);
            for (var i = 0; i < myReimbursementsObj.items.length; i++) {
                myReimbursementsObj.items[i].billDate = JSON.stringify(myReimbursementsObj.items[i].billDate).split('T')[0].slice(1);
                delete myReimbursementsObj.items[i].startOpened;
                delete myReimbursementsObj.items[i].$$hashKey;
            }
            console.log("Final data", myReimbursementsObj);
            console.log("Final data", JSON.stringify(myReimbursementsObj));
            console.log("index", index)

            /**Reference to File Handling **/
            var file = vm.myFile;
            console.log("file", file)
            // var uploadUrl = "../server/service.php", //Url of webservice/api/server
            //     promise = fileUploadService.uploadFileToUrl(file, uploadUrl);

            // promise.then(function (response) {
            //     $scope.serverResponse = response;
            // }, function () {
            //     $scope.serverResponse = 'An error has occurred';
            // })

            // if (form.$valid) {
            //     vm.enableSaveBtn = false;
            //     var assignedUsers = [];
            //     assignedUsers.push(vm.user);
            // } else {
            //     vm.enableSaveBtn = true;
            //     vm.alerts.push({ msg: "Please fill the required fields", type: 'danger' });
            // }
        };

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                if (false) {
                    vm.isNew = false;
                } else {
                    vm.isNew = true;
                }
                vm.myReimbursementsObj.name = vm.user.name;
                vm.myReimbursementsObj.employeeId = vm.user.employeeId;
                console.log("user", user);
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
                resolve : {
                    reimbursementId : function() {
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
        vm.myReimbursementsObj = {
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

        vm.accept = function (form, myReimbursementsObj) {
        };

        vm.reject = function () {
            $uibModalInstance.dismiss('cancel');
        };

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.myReimbursementsObj.name = vm.user.name;
                vm.myReimbursementsObj.id = vm.user.employeeId;
                vm.myReimbursementsObj.managerName = vm.user.projects[vm.user.projects.length - 1].ownerName;
                console.log("user", user);
            });
            getMyReimbursementById()
        }
        initController();
    };

})();
