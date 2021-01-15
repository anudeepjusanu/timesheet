(function () {
  "use strict";
  var values = [];
  angular
    .module("app")
    .controller("Investment.IndexController", InvestmentController)
    .controller("Investment.TaxOldRegimeController", TaxOldRegimeController)
    .controller("Investment.TaxNewRegimeController", TaxNewRegimeController)

    .controller(
      "Investment.accountInvestmentController",
      AccountInvestmentController
    )
    .controller(
      "Investment.userInvestmentModalController",
      userInvestmentModalController
    )

    .directive("ngFileModel", [
      "$parse",
      function ($parse) {
      

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

  function InvestmentController($scope, UserService, TaxSavingService) {
    var vm = this;
    vm.user = {};

    function initController() {
      UserService.GetCurrent().then(function (user) {
        console.log("user", user);
        localStorage.setItem("print", "false");
        localStorage.removeItem("taxSavingId");

       // vm.user.userRole = "finance";
      });
    }

    initController();
  }

  function TaxOldRegimeController(
    $scope,
    UserService,
    _,
    InvestmentService,
    $state,
    $stateParams,
    TaxSavingService,
    noty
  ) {
    var vm = this;
    (vm.user = {}),
      (vm.financialYear = "2020-2021"),
      (vm.taxSavingId = ""),
      (vm.receipts = []),
      (vm.min = 0),
      (vm.max = 400000),
      (vm.print = false);
    (vm.schemeNew = "-"),
      (vm.amount = 0),
      (vm.searchObj = {
        status: "80C-LIC",
        startMonth: "Apr",
        endMonth: "Mar",
      });
    vm.months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    vm.fileStatus = [
      "80C-LIC",
      "80C-PPF",
      "80C - ULIP",
      "80C-Home Loan Account Scheme",
      "80C-ELSS",
      "80C-N S C purchase",
      "80C-Housing Loan Principal",
      "80C-Contribution to Pension scheme",
      "80C-Contribution to Retirement",
      "80C-Children Education",
      "80C-No. of school going children",
      "80C-Other",
      "80C-Employees Contribution to PF",
      "80C-Employees Voluntary Contribution to PF",
      "80C-Scheme (Sec 80 CCG)",
      "80C-NPS-2015",
      "80C-Medical Insurance Premium",
      "80C-(U/s.80D)",
      "80C-(U/s.80E)",
      "80C-(U/s.80U)",
      "80C-(U/s 80TTA)",
      "80C-(U/s 80TTB)",
      "80C-Loan taken prior to 1 April, 1999",
      "80C-Loan taken on or after 1 April, 1999",
      "80C-Interest on self occupied housing loan*",
      "80C-First time home buyers deduction",
      "80C-Loan has been sanctioned",
      "80C-Loan taken",
      "80C-Rent Received",
      "80C-Interest Paid",
      "80C-Municipal Taxes",
      "80C-Rental Receipts",
      "80C- govt has removed the conveyance",
      "80C-Leave Travel Bills",
    ];
    vm.investmentDeclaration = {
      employee_name: "",
      panCard: "",
      designation: "",
      dateOfJoin: "",
      employeeId: "",
      schemeType: "old",
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
      secArowSubTotal: "",
      secArow15: "",
      secArow16: "",
      secBrow1: "",
      secBrow2: "",
      secBrow3: "",
      secBrow4: "",
      secBrow5: "",
      secBrow6col1: "",
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
      secEcol1: "",
      secEcol3: "",
      secEcol3: "",
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
    };
    console.log("employeeId", $stateParams);
    $scope.change = function () {
      console.log("vm.investmentDeclaration total",vm.investmentDeclaration)
      vm.investmentDeclaration.secArowSubTotal =
       Number(vm.investmentDeclaration.secArow1 ) +
      Number(vm.investmentDeclaration.secArow2)   +
      Number(vm.investmentDeclaration.secArow3)   +
      Number(vm.investmentDeclaration.secArow4)   +
      Number(vm.investmentDeclaration.secArow5)   +
      Number(vm.investmentDeclaration.secArow6)   +
      Number(vm.investmentDeclaration.secArow7)   +
      Number(vm.investmentDeclaration.secArow8)   +
      Number(vm.investmentDeclaration.secArow9)   +
      Number(vm.investmentDeclaration.secArow10)   +
      Number(vm.investmentDeclaration.secArow11)   +
      Number(vm.investmentDeclaration.secArow12)   +
      Number(vm.investmentDeclaration.secArow13)   +
      Number(vm.investmentDeclaration.secArow14)   
 
    };
    function convert(str) {
      var date = new Date(str),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
      return [date.getFullYear(), month, day].join("-");
    }

    $scope.onCategoryChange = function (value) {
      console.log("changed value ", value);
    };

    vm.sbmitNowInvestmentDeclaration = function (submit) {
      console.log("submit", submit);

      console.log("form", vm.investmentDeclaration);
      var formData = new FormData();

      for (let [key, value] of Object.entries(vm.investmentDeclaration)) {
        formData.append(key, value);
      }
      formData.append("userId", vm.user._id);
      if (submit) {
        formData.append("status", "Submitted");
      }
      //  formData.append('file',vm.receipts[0]._file)

      let data = Object.fromEntries(formData);
      console.log("data", data);
      //add receipt
      const promises = [];

      for (let i = 0; i < vm.receipts.length; i++) {
        //       ^^^−−−−−−−−−−−−−−−−−−−−−−−− added missing declaration
        promises.push(fileUpload(vm.receipts[i]._file));
      }
      promises.push(updateTaxSaving(data));

      Promise.all(promises)
        .then((results) => {
          console.log("All done", results);
          vm.receipts=[];
          values = [];
          if (submit) {
            noty.showSuccess("submitted successfully!");
          } else {
            noty.showSuccess("saved successfully!");
          }
        })
        .catch((e) => {
          console.log("All error", e);
        });

      //updateTaxSaving

      // TaxSavingService.updateTaxSaving(vm.taxSavingId, data).then(function (
      //   taxSavingForm
      // ) {
      //   console.log("updateTaxSaving", taxSavingForm);
      // });
    };

    function updateTaxSaving(data) {
      return new Promise((resolve) => {
        delete data.receipts;
        delete data._id;

        TaxSavingService.updateTaxSaving(vm.taxSavingId, data).then(function (
          taxSavingForm
        ) {
          console.log("updateTaxSaving", taxSavingForm);
          resolve(taxSavingForm);
        });
      });
    }

    function fileUpload(file) {
      return new Promise((resolve) => {
        var receiptFormData = new FormData();
        receiptFormData.append("file", file);
        receiptFormData.append("category", vm.searchObj.status);
        if (vm.searchObj.status === "80C-Rental Receipts") {
          receiptFormData.append("startMonth", vm.searchObj.startMonth);
          receiptFormData.append("endMonth", vm.searchObj.endMonth);
        }

        receiptFormData.append("amount", vm.amount);
        let receiptData = Object.fromEntries(receiptFormData);
        console.log("receiptData", receiptData);
        console.log("vm.taxSavingId", vm.taxSavingId);

        TaxSavingService.addTaxSavingReceipt(vm.taxSavingId, receiptData).then(
          function (taxSavingForm) {
            console.log("taxSavingForm", taxSavingForm);
            resolve(taxSavingForm);
          }
        );
      });
    }

    $scope.modelSetter = function (values) {
      console.log("values", values);
      vm.receipts = values;
      // vm.investmentDeclaration.sectionAFiles = values;
    };

    vm.printToPdf = function (printSection) {
      // get the content of html element that you want to print
      var innerContents = document.getElementById(printSection).innerHTML;
      // open a popup window to draw your html
      var popupWinindow = window.open(
        "",
        "_blank",
        "width=700,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
      );
      popupWinindow.document.open();
      // embed your css file and CDN css file into head, embed html content into body
      popupWinindow.document.write(
        `<html><head>
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

    </head><body onload="window.print()">` +
          innerContents +
          `</html>`
      );
      popupWinindow.popupWinindow();
    };

    function getUserForm() {
      // getMyTaxSaving

      TaxSavingService.getMyTaxSaving(vm.financialYear.trim()).then(function (
        getMyTaxSaving
      ) {
        console.log("getMyTaxSaving", getMyTaxSaving);
        vm.taxSavingId = getMyTaxSaving.taxSaving._id;

        getPersonalUserForm(vm.taxSavingId);
      });
    }
    function convertIntObj(obj) {
      const res = {};
      for (const key in obj) {
        res[key] = {};
        for (const prop in obj[key]) {
          const parsed = parseInt(obj[key][prop], 10);
          res[key][prop] = isNaN(parsed) ? obj[key][prop] : parsed;
        }
      }
      return res;
    }
    function getPersonalUserForm(taxSavingId) {
      //console.log("$localStorage.print",$localStorage.print)
      console.log(localStorage.getItem("print"));
      //getTaxSaving
      TaxSavingService.getTaxSaving(taxSavingId).then(
        function (response) {
          if (response) {
            console.log("getTaxSaving response", response);
            if (!response.taxSaving.employee_name) {
              vm.investmentDeclaration.employee_name = vm.user.name;
              vm.investmentDeclaration.designation = vm.user.designation;
              vm.investmentDeclaration.employeeId = vm.user.employeeId;
              vm.investmentDeclaration.dateOfJoin = convert(vm.user.joinDate);
            } else {
              let investmentDeclaration = convertIntObj(response);
              vm.investmentDeclaration = investmentDeclaration.taxSaving;
              console.log("vm.investmentDeclaration", vm.investmentDeclaration);
              vm.investmentDeclaration.userId = vm.user._id;
              vm.investmentDeclaration.financialYear =
                response.taxSaving.financialYear;
              vm.investmentDeclaration.createdOn = response.taxSaving.createdOn;

              if (vm.investmentDeclaration.dateOfJoin) {
                vm.investmentDeclaration.dateOfJoin = convert(
                  response.taxSaving.dateOfJoin
                );
              }
              if (vm.investmentDeclaration.status === "Submitted") {
                let inputs = document.getElementsByTagName("input");
                //.setAttribute("readonly", "readonly");
                for (var i = 0; i < inputs.length; i++) {
                  inputs[i].setAttribute("readonly", "true");
                }
              }
              if (localStorage.getItem("print") === "true") {
                vm.print = true;
              } else {
                vm.print = false;
              }
              //testing for get receipt
              // TaxSavingService.getTaxSavingReceipt(
              //   "600143043620ee6d05ff9642"
              // ).then(function (receipt) {
              //   console.log("receipt info", receipt);
              // });
            }
          } else {
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
      if (localStorage.getItem("taxSavingId")) {
        localStorage.setItem("print", "true");

        getPersonalUserForm(localStorage.getItem("taxSavingId"));
      } else {
        UserService.GetCurrent().then(function (user) {
          console.log("user", user);
          vm.user = user;

          // getCall
          getUserForm(user.employeeId, vm.financialYear);
        });
      }
    }
    initController();
  }

  function TaxNewRegimeController($scope, noty) {
    var vm = this;

    function initController() {
      noty.showSuccess("Please contact your Administrator");
    }

    initController();
  }

  function AccountInvestmentController(
    $scope,
    UserService,
    _,
    InvestmentService,
    TaxSavingService,
    $uibModal
  ) {
    var vm = this;
    vm.alerts = [];
    vm.searchObj = {
      status: "Submitted",
    };
    vm.Investments = [];
    vm.investmentStatus = ["Submitted"];

    vm.openInvestmentModal = function (investmentObj) {
      var modalInstance = $uibModal
        .open({
          animation: true,
          ariaLabelledBy: "modal-title",
          ariaDescribedBy: "modal-body",
          templateUrl: "InvestmentDeclaration/userInvestment.html",
          controller: "Investment.userInvestmentModalController",
          controllerAs: "vm",
          size: "lg",
          resolve: {
            userObj: function () {
              return vm.user;
            },
            investmentObj: function () {
              return investmentObj;
            },
          },
        })
        .result.then(
          function () {
            // getAccountReimbursements();
          },
          function () {
            // getAccountReimbursements();
          }
        );
    };

    $scope.convert = function (str) {
      var date = new Date(str),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
      return [date.getFullYear(), month, day].join("-");
    };

    function getInvestments() {
      // InvestmentService.getInvestments().then(
      //   function (userInvestments) {
      //     console.log("userInvestments", userInvestments);
      //     vm.Investments = userInvestments;
      //   },
      //   function (error) {
      //     if (error) {
      //       console.log("error", error);
      //     }
      //   }
      // );

      TaxSavingService.getAccountTaxSavings().then(function (
        getAccountTaxSaving
      ) {
        console.log("getAccountTaxSaving", getAccountTaxSaving.taxSavings);
        vm.Investments = getAccountTaxSaving.taxSavings;
      });
    }

    function initController() {
      getInvestments();
    }

    initController();
  }

  function userInvestmentModalController(
    UserService,
    ReimbursementService,
    investmentObj,
    _,
    $uibModal,
    $uibModalInstance,
    $filter,
    $state
  ) {
    var vm = this;
    vm.investmentObj = investmentObj;
    console.log("investmentObj", investmentObj);

    vm.close = function () {
      $uibModalInstance.dismiss("cancel");
    };

    vm.getUserForm = function (investmentObj) {
      $uibModalInstance.dismiss("cancel");
      localStorage.setItem("print", "true");
      localStorage.setItem("taxSavingId", investmentObj._id);

      $state.go("TaxOldRegime", {
        investmentObj: investmentObj,
        print: true,
      });
    };
  }
})();
