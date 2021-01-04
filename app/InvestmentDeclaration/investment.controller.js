(function () {
  "use strict";

  angular
    .module("app")
    .controller("Investment.IndexController", InvestmentController)
    .controller("Investment.TaxOldRegimeController", TaxOldRegimeController)
    .controller(
      "Investment.accountInvestmentController",
      AccountInvestmentController
    )
    .controller('Investment.userInvestmentModalController', userInvestmentModalController)

    .directive("ngFileModel", [
      "$parse",
      function ($parse) {
        var values = [];

        return {
          restrict: "A",
          link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFileModel);
            var isMultiple = attrs.multiple;
            var modelSetter = model.assign;
            element.bind("change", function () {
              angular.forEach(element[0].files, function (item) {
                var value = {
                  // File Name
                  name: item.name,
                  //File Size
                  size: item.size,
                  //File URL to view
                  url: URL.createObjectURL(item),
                  // File Input Value
                  _file: item,
                };
                values.push(value);
              });
              scope.$apply(function () {
                if (isMultiple) {
                  scope.modelSetter(values);
                  scope.variable = scope.$eval(attrs.ngFileModel);

                  console.log("values", scope.variable);
                } else {
                  modelSetter(scope, values[0]);
                  console.log("values", values);
                }
              });
            });
          },
        };
      },
    ])
    .filter("InvestmentsSearch", function ($filter) {
      return function (input, searchObj) {
        var output = input;
        if (
          searchObj.status &&
          searchObj.status.length > 0 &&
          searchObj.status != "All"
        ) {
          output = $filter("filter")(output, function (item) {
            return item.status == searchObj.status;
          });
        }
        return output;
      };
    });

  function InvestmentController($scope, UserService) {
    var vm = this;
    vm.user = {};

    function initController() {
      UserService.GetCurrent().then(function (user) {
        console.log("user", user);
        vm.user.userRole = "finance";
      });
    }

    initController();
  }

  function TaxOldRegimeController($scope, UserService, _, InvestmentService,$state,$stateParams) {
    var vm = this;
    vm.user = {},
    vm.financialYear = '2020 - 2021',
    vm.print = false;
      vm.investmentDeclaration = {
        Name: "",
        Pan: "",
        Designation: "",
        DOJ: "",
        EmpId: "",
        schemeOld: "",
        schemeNew: "",
        secArow1: "",
        secArow2: "",
        secArow3: "",
        secArow4: "",
        secArow5: "",
        secArow6: "",
        secArow7: "",
        secArow8: "",
        secArow9: "",
        secArow10: "",
        secArow11: "",
        secArow11a: "",
        secArow11b: "",
        secArow12: "",
        secArow13: "",
        secArow14: "",
        secArowSubTotal: 0,
        secArow15: "",
        secArow16: "",
        secBrow1: "",
        secBrow2: "",
        secBrow3: "",
        secBrow4: "",
        secBrow5: "",
        secBrow6col1: "Others (please specify)",
        secBrow6: "",
        secCrow1: "",
        secCrow2: "",
        secCrow3: "",
        secCrow4row1: "",
        secCrow4row2: "",
        secCrow5: "",
        secCrow6: "",
        secDrow1: "",
        secDrow2: "",
        secDrow3: "",
        secEcol4: "",
        secEcol5: "",
        secEcol6: "",
        secEcol7: "",
        secEcol8: "",
        secEcol9: "",
        secEcol10: "",
        secEcol11: "",
        secEcol12: "",
        secFrow1: "",
        secFrow2: "",
        signature1: "",
        taxableSalaryIncome: "",
        taxPerquisites: "",
        pfDeducted: "",
        professionDeducted: "",
        taxDeducted: "",
        periOfEmployment: "",
        signature2: "",
        sectionAFiles: [],
      };
      console.log("employeeId",$stateParams)

    function convert(str) {
      var date = new Date(str),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
      return [date.getFullYear(), month, day].join("-");
    }

    vm.saveInvestmentDeclaration = function (investmentDeclaration) {
      console.log("form", vm.investmentDeclaration);
    };

    $scope.modelSetter = function (values) {
      console.log("values", values);
      vm.investmentDeclaration.sectionAFiles = values;
    };


   vm.printToPdf= function(printSection) {
    // get the content of html element that you want to print
    var innerContents = document.getElementById(printSection).innerHTML;
    // open a popup window to draw your html
    var popupWinindow = window.open('', '_blank', 'width=700,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    // embed your css file and CDN css file into head, embed html content into body
    popupWinindow.document.write(`<html><head>
   <style  media="print" type="text/css">
   #printSectionId{
    background-color: #1a4567 !important;

    -webkit-print-color-adjust:exact;

   }
   </style>
       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" media="screen, print" />
    <link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/angular-bootstrap-toggle@0.4.0/dist/angular-bootstrap-toggle.min.css" media="screen, print">
<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" rel="stylesheet" media="screen, print"/>
<link href="app-content/wavelabs.css" rel="stylesheet" media="screen, print"/>

    </head><body onload="window.print()">` + innerContents + `</html>`);
    popupWinindow.popupWinindow();

    }



    function getUserForm(employeeId,financialYear) {
      InvestmentService.getMyInvestmentForm(employeeId).then(
        function (response) {

          if(response){
            console.log("response", response);
            vm.investmentDeclaration = response;
            vm.investmentDeclaration.dateOfJoin = convert(response.dateOfJoin);
  
          }
          else{
//post call with emp id and financial year
          }
                  },
        function (error) {
          if (error) {
            console.log("error", error);
          }
        }
      );
    }

    function initController() {
      if ($stateParams.investmentObj.employeeId) {
        vm.print = true;
       console.log("employeeId",$stateParams.investmentObj.employeeId)
       getUserForm($stateParams.investmentObj.employeeId );


      }else{
        UserService.GetCurrent().then(function (user) {
          console.log("user", user);
          vm.investmentDeclaration.employee_name = user.name;
          vm.investmentDeclaration.designation = user.designation;
          vm.investmentDeclaration.dateOfJoin = convert(user.joinDate);
          vm.investmentDeclaration.employeeId = user.employeeId;
  
          // getCall
          getUserForm(user.employeeId,vm.financialYear );
        });
      }


     
    }
    initController();
  }

  function AccountInvestmentController(
    $scope,
    UserService,
    _,
    InvestmentService,
    $uibModal
  ) {
    var vm = this;
    vm.alerts = [];
    vm.searchObj = {
      status: "All",
    };
    vm.Investments = [];
    vm.investmentStatus = ["All", "Submitted", "Pending"];
    
    vm.openInvestmentModal = function (investmentObj) {
      var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'InvestmentDeclaration/userInvestment.html',
          controller: 'Investment.userInvestmentModalController',
          controllerAs: 'vm',
          size: 'lg',
          resolve: {
              userObj: function () {
                  return vm.user;
              },
              investmentObj: function () {
                  return investmentObj;
              }
          }
      }).result.then(function () {
         // getAccountReimbursements();
      }, function () {
         // getAccountReimbursements();
      });
  }


    function getInvestments() {
      InvestmentService.getInvestments().then(
        function (userInvestments) {
          console.log("userInvestments", userInvestments);
          vm.Investments = userInvestments;
        },
        function (error) {
          if (error) {
            console.log("error", error);
          }
        }
      );
    }

    function initController() {
      getInvestments();
    }

    initController();
  }

  function userInvestmentModalController(UserService, ReimbursementService, investmentObj, _, $uibModal, $uibModalInstance, $filter, $state) {
  var vm = this;
  vm.investmentObj = investmentObj
console.log("investmentObj",investmentObj)

vm.close = function () {
  $uibModalInstance.dismiss('cancel');
}

vm.getUserForm = function(investmentObj){
  $uibModalInstance.dismiss('cancel');

  $state.go('TaxOldRegime', {
    investmentObj: investmentObj
})
}


  }
})();
