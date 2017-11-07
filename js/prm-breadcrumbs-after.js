/**
 * Created by samsan on 11/6/17.
 */

angular.module('viewCustom')
    .controller('prmBreadcrumbsAfterCtrl',['$element',function ($element) {
        var vm=this;
        vm.$onChanges=function () {
            //console.log('**** prm-breadcrumbs-after ****');
            //console.log(vm.parentCtrl);
        };

        vm.hover=function (facet) {
            if(facet.hover) {
                facet.hover=false;
            } else {
                facet.hover=true;
            }
        }


    }]);

angular.module('viewCustom')
    .component('prmBreadcrumbsAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmBreadcrumbsAfterCtrl',
        controllerAs:'vm'
        //templateUrl:'/primo-explore/custom/HVD2/html/prm-breadcrumbs-after.html'
    });

