/**
 * Created by samsan on 8/16/17.
 */


angular.module('viewCustom')
    .controller('customTextsmsCtrl',['customService',function (customService) {
        var cisv=customService;
        var vm=this;
        vm.availlibrary=[];
        vm.locations=[];

        // when a user click on text call # icon
        vm.sendSMS=function () {
            var data=cisv.getItems();
            vm.locations=data.currLoc.items;
            vm.availlibrary=vm.parentCtrl.item.pnx.display.availlibrary;
            cisv.setTextData(vm);

        };


    }]);

angular.module('viewCustom')
    .component('customTextsms',{
        bindings:{parentCtrl:'<'},
        controller: 'customTextsmsCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/custom-textsms.html'
    });

