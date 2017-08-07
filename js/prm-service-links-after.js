/**
 * Created by samsan on 8/7/17.
 */

angular.module('viewCustom')
    .controller('prmServiceLinksAfterCtrl',['customService',function (customService) {
        var vm=this;
        var sv=customService;

        vm.$onChanges=function () {

            console.log('*** prm-service-links-after ***');
            console.log(vm);
        };


    }]);


angular.module('viewCustom')
    .component('prmServiceLinksAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmServiceLinksAfterCtrl',
        controllerAs:'vm'
    });

