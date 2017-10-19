/**
 * Created by samsan on 10/19/17.
 * Add BorrowDirect link on full display page under location items
 */


angular.module('viewCustom')
    .controller('prmOpacAfterCtrl',[function () {
        var vm=this;
        vm.borrowInfo={'flag':false,'journal':false,'query':''};

        // validate to see if pnx data meet criteria
        vm.validatePNX=function () {
            if(vm.parentCtrl.item.pnx) {
                let pnx=vm.parentCtrl.item.pnx.control.sourceid;
                for (let i = 0; i < pnx.length; i++) {
                    if(pnx[i]==='HVD_ALEPH') {
                        vm.borrowInfo.flag=true;
                        i=pnx.length;
                    }
                }
                let pnxTypes=vm.parentCtrl.item.pnx.display.type;
                for(let i=0; i < pnxTypes.length; i++) {
                    if(pnxTypes[i]==='journal') {
                        vm.borrowInfo.journal=true;
                        i=pnxTypes.length;
                    }
                }
                if(vm.parentCtrl.item.pnx.addata.isbn) {
                    vm.borrowInfo.query='isbn='+vm.parentCtrl.item.pnx.addata.isbn[0];
                } else if(vm.parentCtrl.item.pnx.display.title) {
                    vm.borrowInfo.query=vm.parentCtrl.item.pnx.display.title[0];
                }
            }

        };

        vm.$onInit=function() {
            vm.validatePNX();
        };



    }]);


angular.module('viewCustom')
    .component('prmOpacAfter',{
        bindings:{parentCtrl:'<'},
        controllerAs:'vm',
        controller: 'prmOpacAfterCtrl',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-opac-after.html'
    });
