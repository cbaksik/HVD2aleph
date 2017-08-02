/**
 * Created by samsan on 7/18/17.
 */
angular.module('viewCustom')
    .controller('prmLocationItemsAfterCtrl',['customService',function (customService) {
        var vm=this;
        var sv=customService;

        vm.$onChanges=function (ev) {
            // capture data and use it in prm-location-item-after component
            sv.setItems(vm.parentCtrl);
        };


    }]);


angular.module('viewCustom')
    .component('prmLocationItemsAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationItemsAfterCtrl'
    });