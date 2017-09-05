/**
 * Created by samsan on 8/15/17.
 * This component will insert textsms and its icon into the action list
 */


angular.module('viewCustom')
    .controller('prmActionListAfterCtrl',['$element','$compile','$scope','$timeout','customService',function ($element,$compile,$scope,$timeout, customService) {
        var vm=this;
        var cisv=customService;
        vm.$onInit=function () {
            // insert  textsms into existing action list
            vm.parentCtrl.actionLabelNamesMap.textsms='Text call #';
            vm.parentCtrl.actionListService.actionsToIndex.textsms=6;
            if(vm.parentCtrl.actionListService.requiredActionsList.indexOf('textsms') === -1) {
                vm.parentCtrl.actionListService.requiredActionsList.push('textsms');
            }
        };

        vm.$onChanges=function() {
            $timeout(function () {
                var el=document.getElementById('textsms');
                if(el) {
                    //remove prm-icon
                    var prmIcon=el.children[0].children[0].children[0].children[0];
                    prmIcon.remove();
                    // insert new icon
                    var childNode=el.children[0].children[0].children[0];
                    var mdIcon=document.createElement('md-icon');
                    mdIcon.setAttribute('md-svg-src','/primo-explore/custom/HVD2/img/ic_textsms_black_24px.svg');
                    childNode.prepend(mdIcon);
                    $compile(childNode)($scope); // refresh the dom
                }

                var printEl=document.getElementById('Print');
                if(printEl) {
                    printEl.children[0].remove();
                    var printTag=document.createElement('custom-print');
                    printTag.setAttribute('parent-ctrl','vm.parentCtrl.item');
                    printEl.appendChild(printTag);
                    $compile(printEl.children[0])($scope);
                }


            },2000);


        };

        vm.$doCheck=function(){
            // pass active action to prm-action-container-after
            if(vm.parentCtrl.activeAction) {
                cisv.setActionName(vm.parentCtrl.activeAction);
            }

        };


    }]);

angular.module('viewCustom')
    .component('prmActionListAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmActionListAfterCtrl',
        controllerAs:'vm'
    });

