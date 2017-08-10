/**
 * Created by samsan on 8/10/17.
 * This component add a "Finding Aid" button and make a link
 */

angular.module('viewCustom')
    .controller('prmBriefResultContainerAfterCtrl',[function () {
        var vm=this;
        vm.item={};
        vm.$onChanges=function () {
            vm.item=vm.parentCtrl.item;
        };

    }]);

angular.module('viewCustom')
    .component('prmBriefResultContainerAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmBriefResultContainerAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-brief-result-container-after.html'
    });

