/* Author: Sam san
   This component is to capture item data from the parentCtrl. Then pass it to prm-view-online-after component
 */
angular.module('viewCustom')
    .controller('prmFullViewAfterCtrl',['prmSearchService',function (prmSearchService) {
        var vm=this;
        var sv=prmSearchService;

        vm.hideBrowseShelf=function () {
            var hidebrowseshelfFlag=false;
            var item=vm.parentCtrl.item;
            if(item.pnx.control) {
                var sourceid=item.pnx.control.sourceid;
                // find if item is HVD_VIA
                if(sourceid.indexOf('HVD_VIA')!== -1) {
                    hidebrowseshelfFlag=true;
                }
            }
            // hide browse shelf if the item is HVD_VIA is true
            if(hidebrowseshelfFlag) {
                var services=vm.parentCtrl.services;
                for(var i=0; i < services.length; i++) {
                    if(services[i].serviceName === 'virtualBrowse') {
                       services.splice(i,1);
                       i=services.length;
                    }
                }
            }

        };

        vm.$onChanges=function () {
            var itemData={'item':{},'searchData':{}};
            itemData.item=angular.copy(vm.parentCtrl.item);
            if(vm.parentCtrl.searchService) {
                itemData.searchData = vm.parentCtrl.searchService.$stateParams;
            }
            // pass this data to use for online section
            sv.setItem(itemData);
            // hide browse shelf it is an image HVD_VIA
            vm.hideBrowseShelf();

        };



    }]);

angular.module('viewCustom')
    .component('prmFullViewAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmFullViewAfterCtrl',
        controllerAs:'vm'
    });
