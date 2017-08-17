/**
 * Created by samsan on 8/15/17.
 * This component will insert custom-textsms component into action list
 */


angular.module('viewCustom')
    .controller('prmActionListAfterCtrl',['$element','$compile','$scope','$timeout','customService',function ($element,$compile,$scope,$timeout, customService) {
        var vm=this;
        var cisv=customService;
        vm.$postLink=function () {
            $timeout(function () {
                var el=$element[0].parentNode.children[0].children[0].children[0].children[0].children[1];
                if(el) {
                    // append dynamic component into action list
                    var textsms = document.createElement('custom-textsms');
                    textsms.setAttribute('parent-ctrl',"vm.parentCtrl");
                    el.append(textsms);
                    $compile(el.children[5])($scope);
                }

            },300)
        };

        vm.$doCheck=function(){
            // pass active action to prm-action-container-after
            if(vm.parentCtrl.activeAction) {
                cisv.setActionName(vm.parentCtrl.activeAction);
            }

        }

    }]);

angular.module('viewCustom')
    .component('prmActionListAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmActionListAfterCtrl',
        controllerAs:'vm'
    });

