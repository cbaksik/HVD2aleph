/**
 * Created by samsan on 8/16/17.
 */


angular.module('viewCustom')
    .controller('customTextsmsCtrl',['$element','$compile','$scope','$sce',function ($element,$compile,$scope,$sce) {
        var vm=this;

        vm.$onChanges=function () {
            console.log('*** custom-textsms ***');
            console.log(vm);
        };

        vm.sendSMS=function () {
            console.log('*** send sms ***');
        };

    }]);

angular.module('viewCustom')
    .component('customTextsms',{
        bindings:{parentCtrl:'<'},
        controller: 'customTextsmsCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/custom-textsms.html'
    });

