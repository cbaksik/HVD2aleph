/**
 * Created by samsan on 7/18/17.
 * This component is to capture parent-ctrl data so it can access Rest base url endpoint to use it an ajax call
 *
 */


angular.module('viewCustom')
    .controller('prmLocationsAfterCtrl',['customService',function (customService) {
        var vm=this;
        var sv=customService;

        vm.$doCheck=function () {
            // remove network resource display from location
            if(vm.parentCtrl.locations) {
                var results = vm.parentCtrl.locations;
                var temp = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].location.libraryCode !== 'HVD_NET') {
                        temp.push(results[i]);
                    }
                }
                if (temp.length > 0) {
                    // reset location
                    vm.parentCtrl.locations[0] = temp;
                }
            }

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
