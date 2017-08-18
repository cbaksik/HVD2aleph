/**
 * Created by samsan on 8/16/17.
 */


angular.module('viewCustom')
    .controller('customTextsmsCtrl',[function () {
        var vm=this;

    }]);

angular.module('viewCustom')
    .component('customTextsms',{
        bindings:{parentCtrl:'<'},
        controller: 'customTextsmsCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/custom-textsms.html'
    });

