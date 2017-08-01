/**
 * Created by samsan on 7/18/17.
 */

angular.module('viewCustom')
    .controller('prmLocationAfterCtrl',['$element','customService',function ($element, customService) {
        var vm=this;
        var sv=customService;

        vm.$onChanges=function () {

            console.log('*** prm-location-after ***');
            console.log(vm);
        };


    }]);


angular.module('viewCustom')
    .component('prmLocationAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationAfterCtrl',
        controllerAs:'vm'
    });
