/**
 * Created by samsan on 8/15/17.
 */

angular.module('viewCustom')
    .controller('prmActionContainerAfterCtrl',['$element',function ($element) {
        var vm=this;
        vm.$onChanges=function () {

            console.log('*** prm-action-container-after ***');
            console.log(vm);

        };

    }]);

angular.module('viewCustom')
    .component('prmActionContainerAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmActionContainerAfterCtrl',
        controllerAs:'vm2'
    });

