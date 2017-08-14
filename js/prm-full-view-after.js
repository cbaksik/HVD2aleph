angular.module('viewCustom')
    .controller('prmFullViewAfterCtrl',['prmSearchService',function (prmSearchService) {
        var vm=this;
        var sv=prmSearchService;

        vm.$onChanges=function () {
            var itemData={'item':{},'searchData':{}};
            itemData.item=angular.copy(vm.parentCtrl.item);
            if(vm.parentCtrl.searchService) {
                itemData.searchData = vm.parentCtrl.searchService.$stateParams;
            }
            sv.setItem(itemData);

        };

    }]);

angular.module('viewCustom')
    .component('prmFullViewAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmFullViewAfterCtrl',
        controllerAs:'vm'
    });
