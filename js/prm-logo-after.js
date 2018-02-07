/**
 * Created by samsan on 8/9/17.
 * It remove old logo and replace it with new logo
 */

angular.module('viewCustom')
    .controller('prmLogoAfterCtrl',['$element','customGoogleAnalytic',function ($element,customGoogleAnalytic) {
        var vm=this;
        var cga=customGoogleAnalytic;
        vm.$onInit=function() {
          // initialize Google Analytic so it can use in other controllers
          cga.init();
        };

        vm.$onChanges=function () {
            // remove image logo
            var el=$element[0].parentNode.children[0];
            if(el) {
                el.remove();
            }

            // remove skip link
            var el2 = $element[0].parentNode.parentNode.children[0];
            if(el2) {
                el2.remove();
            }
        };

    }]);

angular.module('viewCustom')
    .component('prmLogoAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLogoAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-logo-after.html'
    });
