/**
 * Created by samsan on 8/15/17.
 */


angular.module('viewCustom')
    .controller('prmActionListAfterCtrl',['$element','$compile','$scope','$sce','$timeout',function ($element,$compile,$scope,$sce, $timeout) {
        var vm=this;
        vm.createTextIcon=function () {
            var el=$element[0].parentNode.children[0].children[0].children[0].children[0].children[1];
            console.log('*** el ****');
            console.log(el);
        };

        vm.$onChanges=function () {

            //vm.createTextIcon();

            console.log('*** prm-action-list-after ***');
            console.log(vm);

            console.log($element);

        };

        vm.$postLink=function () {

            $timeout(function () {
                var el=$element[0].parentNode.children[0].children[0].children[0].children[0].children[1];
                console.log('**** el ****');
                console.log(el);

                var textsms=document.createElement('custom-textsms');
                //el.insertBefore(textsms,el.children[1]);
                el.append(textsms);
                $compile(el.children[5])($scope);

            },300)
        }

    }]);

angular.module('viewCustom')
    .component('prmActionListAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmActionListAfterCtrl',
        controllerAs:'vm'
    });

