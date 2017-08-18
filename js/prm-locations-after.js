/**
 * Created by samsan on 7/18/17.
 * This component is to capture parent-ctrl data so it can access Rest base url endpoint to use it an ajax call
 *
 */


angular.module('viewCustom')
    .controller('prmLocationsAfterCtrl',['customService',function (customService) {
        var vm=this;
        var sv=customService;

        vm.$onChanges=function () {
            // capture restBaseUrl to use it in prm-location-item-after component
            sv.setParentData(vm.parentCtrl);
        };

    }]);


angular.module('viewCustom')
    .component('prmLocationsAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationsAfterCtrl',
        controllerAs:'vm'
    });
