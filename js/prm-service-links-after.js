/**
 * Created by samsan on 8/7/17.
 */

angular.module('viewCustom')
    .controller('prmServiceLinksAfterCtrl',['customService','customImagesService','$timeout',function (customService, customImagesService, $timeout) {
        var vm=this;
        var sv=customService;
        var cisv=customImagesService;
        vm.itemList=[];
        vm.recordLinks=[]; // keep track the original vm.parentCtrl.recordLinks

        vm.getData=function () {
            // make a copy to avoid data binding
            vm.recordLinks = angular.copy(vm.parentCtrl.recordLinks);
            // get items that have digital bookplates
            vm.itemList=cisv.extractImageUrl(vm.parentCtrl.item, vm.recordLinks);
            // delay data from parentCtrl
            $timeout(function () {
                vm.recordLinks = angular.copy(vm.parentCtrl.recordLinks);
                vm.itemList=cisv.extractImageUrl(vm.parentCtrl.item, vm.recordLinks);
                if(vm.recordLinks.length > 0 && vm.itemList.length > 0) {
                    vm.parentCtrl.recordLinks = cisv.removeMatchItems(vm.recordLinks, vm.itemList);
                }
            },1500);

        };

        vm.$onChanges=function() {
            vm.getData();
        }


    }]);


angular.module('viewCustom')
    .component('prmServiceLinksAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmServiceLinksAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-service-links-after.html'
    });

