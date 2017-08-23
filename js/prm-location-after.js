/**
 * Created by samsan on 8/23/17.
 */

angular.module('viewCustom')
    .controller('prmLocationAfterCtrl',['$element','$compile','$scope','$timeout','$window',function ($element,$compile,$scope,$timeout, $window) {
        var vm=this;

        vm.$onInit=function() {
            $timeout(function () {
                var mdIcon=document.createElement('md-icon');
                mdIcon.setAttribute('md-svg-src','/primo-explore/custom/HVD2/img/place.svg');
                mdIcon.setAttribute('class','placeIcon');
                mdIcon.setAttribute('ng-click','vm.goPlace(vm.parentCtrl.location,$event)');
                var el=$element[0].parentNode.children[0].children[0].children[0].children[0];
                if(el.className !== 'placeIcon') {
                    el.prepend(mdIcon);
                    $compile(el)($scope);
                }

            },500);

        };

        vm.goPlace=function (loc,e) {
            e.stopPropagation();
            var url='http://nrs.harvard.edu/urn-3:hul.ois:' + loc.mainLocation;
            window.open(url,'_blank');
            return true;
        }




    }]);


angular.module('viewCustom')
    .component('prmLocationAfter',{
        bindings:{parentCtrl:'<'},
        controllerAs:'vm',
        controller: 'prmLocationAfterCtrl'
    });

