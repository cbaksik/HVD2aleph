/**
 * Created by samsan on 7/18/17.
 */
angular.module('viewCustom')
    .controller('prmLocationItemsAfterCtrl',['customService',function (customService) {
        var vm=this;
        var sv=customService;
        vm.logicList=[];
        // get static xml data and convert to json
        vm.getLibData=function () {
            sv.getAjax('/primo-explore/custom/HVD2/lib/requestLinkLogic.xml', {}, 'get')
                .then(function (respone) {
                    if (respone.status === 200) {
                        vm.logicList = sv.convertXML(respone.data);
                        sv.setLogicList(vm.logicList);
                    }
                }, function (err) {
                    console.log(err);
                })

        };

        vm.$onInit=function() {
           vm.getLibData();
        };

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