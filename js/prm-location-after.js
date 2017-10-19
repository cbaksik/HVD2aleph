/**
 * Created by samsan on 8/23/17.
 */

angular.module('viewCustom')
    .controller('prmLocationAfterCtrl',['$element','$compile','$scope','$window',function ($element,$compile,$scope, $window) {
        var vm=this;
        vm.libraryName='';

        //insert icon and copy the library name. Then format it.
        vm.createIcon=function () {
            // insert place icon and align it
            var el = $element[0].parentNode.children[0].children[0].children[0].children[0];
            if(el.children) {
                if (el.children[0].tagName === 'H3' && vm.libraryName) {
                    el.children[0].remove();
                    var h3 = document.createElement('h3');
                    h3.innerText = vm.libraryName;
                    var mdIcon = document.createElement('md-icon');
                    mdIcon.setAttribute('md-svg-src', '/primo-explore/custom/HVD2/img/place.svg');
                    mdIcon.setAttribute('class', 'placeIcon');
                    mdIcon.setAttribute('ng-click', 'vm.goPlace(vm.parentCtrl.location,$event)');
                    h3.appendChild(mdIcon);
                    el.prepend(h3);
                    $compile(el.children[0])($scope);

                }
            }

        };

        vm.$doCheck=function() {
            // insert place icon and align it
            var el = $element[0].parentNode.children[0].children[0].children[0].children[0];
            if(el.children) {
                if (el.children[0].tagName === 'H3' && !vm.libraryName) {
                    var text = el.children[0].innerText;
                    if (text) {
                        vm.libraryName = text;
                    }

                }
            }
        };

        vm.$onInit=function() {
          $scope.$watch('vm.libraryName',function () {
              if(vm.libraryName) {
                  vm.createIcon();
              }
          });

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

