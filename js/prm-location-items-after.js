/**
 * Created by samsan on 7/18/17.
 */
angular.module('viewCustom')
    .controller('prmLocationItemsAfterCtrl',['$element','customService',function ($element,customService) {
        var vm=this;
        var sv=customService;

        vm.$onChanges=function (ev) {
            console.log('*** prm-location-items-after ***');
            console.log(vm);
            sv.setItems(vm.parentCtrl);

        }

    }]);


angular.module('viewCustom')
    .component('prmLocationItemsAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationItemsAfterCtrl'
    });