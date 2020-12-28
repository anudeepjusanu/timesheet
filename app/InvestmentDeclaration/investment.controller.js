(function() {
    'use strict';

    angular
        .module('app')
        .controller('Investment.IndexController', InvestmentController)
        .directive('ngFileModel', ['$parse', function ($parse) {
            var values = []
    
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.ngFileModel);
                    var isMultiple = attrs.multiple;
                    var modelSetter = model.assign;
                    element.bind('change', function () {
                        angular.forEach(element[0].files, function (item) {
                            var value = {
                               // File Name 
                                name: item.name,
                                //File Size 
                                size: item.size,
                                //File URL to view 
                                url: URL.createObjectURL(item),
                                // File Input Value 
                                _file: item
                            };
                            values.push(value);
                            
                        });
                        scope.$apply(function () {
                            if (isMultiple) {
                                modelSetter(scope, values);
                                scope.variable = scope.$eval(attrs.ngFileModel);

                                console.log("values",scope.variable)
                            } else {
                                modelSetter(scope, values[0]);
                                console.log("values",values)
    
                            }
                        });
                    });
                }
            };
        }]);
    
    function InvestmentController(UserService, _, SurveyService) {
        var vm = this;
        vm.files = [],
vm.investmentDeclaration = {
    Name :'',
    Pan:'',
    Designation:'',
    DOJ:'',
    EmpId:'',
    schemeOld:'',
    schemeNew:'',
    secArow1:'',
    secArow2:'',
    secArow3:'',
    secArow4:'',
    secArow5:'',
    secArow6:'',
    secArow7:'',
    secArow8:'',
    secArow9:'',
    secArow10:'',
    secArow11:'',
    secArow11a:'',
    secArow11b:'',
    secArow12:'',
    secArow13:'',
    secArow14:'',
    secArowSubTotal:0,
    secArow15:'',
    secArow16:'',
    secBrow1:'',
    secBrow2:'',
    secBrow3:'',
    secBrow4:'',
    secBrow5:'',
    secBrow6col1:'Others (please specify)',
    secBrow6:'',
    secCrow1:'',
    secCrow2:'',
    secCrow3:'',
    secCrow4row1:'',
    secCrow4row2:'',
    secCrow5:'',
    secCrow6:'',
    secDrow1:'',
    secDrow2:'',
    secDrow3:'',
    secEcol4:'',
    secEcol5:'',
    secEcol6:'',
    secEcol7:'',
    secEcol8:'',
    secEcol9:'',
    secEcol10:'',
    secEcol11:'',
    secEcol12:'',
       secFrow1:'',
    secFrow2:'',
    signature1:'',
    taxableSalaryIncome:'',
    taxPerquisites:'',
    pfDeducted:'',
    professionDeducted:'',
    taxDeducted:'',
    periOfEmployment:'',
    signature2:'',
    sectionAFiles:[]
    


}


            function convert(str) {
                var date = new Date(str),
                  month = ("0" + (date.getMonth() + 1)).slice(-2),
                  day = ("0" + date.getDate()).slice(-2);
                return [date.getFullYear(), month, day].join("-");
              }

              vm.saveInvestmentDeclaration = function (investmentDeclaration) {
              console.log("form", vm.investmentDeclaration)

              }

           
            function modelSetter(scope,values){

                console.log("values",values)

            }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                console.log("user",user)
                vm.investmentDeclaration.Name = user.name;
                vm.investmentDeclaration.Designation = user.designation;
                vm.investmentDeclaration.DOJ = convert(user.joinDate);
                vm.investmentDeclaration.EmpId = user.employeeId;

            })
        }
        initController();
    };

   
          
    


})();

