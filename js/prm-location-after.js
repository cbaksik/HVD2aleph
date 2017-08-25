/**
 * Created by samsan on 8/23/17.
 */

angular.module('viewCustom')
    .controller('prmLocationAfterCtrl',['$element','$compile','$scope','$timeout','$window',function ($element,$compile,$scope,$timeout, $window) {
        var vm=this;

        vm.$onChanges=function() {
            $timeout(function () {
                // insert place icon and set align
                var mdIcon=document.createElement('md-icon');
                mdIcon.setAttribute('md-svg-src','/primo-explore/custom/HVD2/img/place.svg');
                mdIcon.setAttribute('class','placeIcon');
                mdIcon.setAttribute('ng-click','vm.goPlace(vm.parentCtrl.location,$event)');
                var el=$element[0].parentNode.children[0].children[0].children[0].children[0];
                if(el.className !== 'placeIcon') {
                    var text = el.children[0].innerText;
                    var w = text.length * 10;
                    if(text.length > 15 && text.length < 20) {
                        w+=5;
                    } else if(text.length <= 8) {
                        w+=12;
                    } else if(text.length > 25) {
                        w=text.length * 8;
                    }
                    mdIcon.setAttribute('style','left:'+ w +'px');
                    el.prepend(mdIcon);
                    $compile(el)($scope);

                }

            },500);


        };

        vm.goPlace=function (loc,e) {
            e.stopPropagation();
            var url='http://nrs.harvard.edu/urn-3:hul.ois:' + loc.mainLocation;
            $window.open(url,'_blank');
            return true;
        }




    }]);


angular.module('viewCustom')
    .component('prmLocationAfter',{
        bindings:{parentCtrl:'<'},
        controllerAs:'vm',
        controller: 'prmLocationAfterCtrl'
    });

