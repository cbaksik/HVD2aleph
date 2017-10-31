/**
 * Created by samsan on 9/25/17.
 */



angular.module('viewCustom')
    .controller('prmSearchResultListAfterCtrl',['customGoogleAnalytic','$element',function (customGoogleAnalytic, $element) {
        var vm=this;
        var cga=customGoogleAnalytic;
        //capture search result and report to google analytic
        vm.$onChanges=function () {
            cga.setPage('/search', vm.parentCtrl.query);
            if(vm.parentCtrl.isFavorites===false) {
                // remove left margin on result list grid
                var el = $element[0].parentNode.parentNode.parentNode;
                el.children[0].remove();
            }
        };


    }]);


angular.module('viewCustom')
    .component('prmSearchResultListAfter',{
        bindings:{parentCtrl:'<'},
        controllerAs:'vm',
        controller: 'prmSearchResultListAfterCtrl'
    });

