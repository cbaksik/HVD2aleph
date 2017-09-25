/**
 * Created by samsan on 9/25/17.
 */



angular.module('viewCustom')
    .controller('prmSearchResultListAfterCtrl',['customGoogleAnalytic',function (customGoogleAnalytic) {
        var vm=this;
        var cga=customGoogleAnalytic;
        //capture search result and report to google analytic
        vm.$onChanges=function () {
            cga.setPage('/search', vm.parentCtrl.query);
        };


    }]);


angular.module('viewCustom')
    .component('prmSearchResultListAfter',{
        bindings:{parentCtrl:'<'},
        controllerAs:'vm',
        controller: 'prmSearchResultListAfterCtrl'
    });

