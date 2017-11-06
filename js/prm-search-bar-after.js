/**
 * Created by samsan on 9/25/17.
 */

angular.module('viewCustom')
    .controller('prmSearchBarAfterCtrl',['$element','$location','$compile','$scope','$mdMedia',function ($element,$location,$compile,$scope,$mdMedia) {
        var vm=this;
        vm.browseClass='switch-to-advanced md-button md-primoExplore-theme browse-button';
        vm.$onInit=function () {
            var el=$element[0].parentNode.children[0].children[0].children[2];
            var button=document.createElement('button');
            button.setAttribute('id','browseButton');
            button.setAttribute('ng-class','vm.browseClass');
            button.setAttribute('ng-click','vm.gotoBrowse()');
            var textNode=document.createTextNode('STARTS WITH (BROWSE BY...)');
            if($mdMedia('xs') || $mdMedia('sm')) {
                textNode=document.createTextNode('BROWSE');
            }
            button.appendChild(textNode);
            var browseBtn=document.getElementById('browseButton');
            // if browse button doesn't exist, add new one
            if(!browseBtn) {
                el.appendChild(button);
                $compile(el)($scope);
            }
            // change css class start browse
            $scope.$watch('vm.parentCtrl.$scope.$ctrl.advancedSearch',function () {
                if( vm.parentCtrl.$scope.$ctrl.advancedSearch) {
                    vm.browseClass='switch-to-simple md-button md-primoExplore-theme browse-button';
                } else {
                    vm.browseClass='switch-to-advanced md-button md-primoExplore-theme browse-button';
                }
            });

        };

        vm.gotoBrowse=function () {
            $location.path('/browse');
        };

    }]);

angular.module('viewCustom')
    .component('prmSearchBarAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmSearchBarAfterCtrl',
        controllerAs:'vm'
    });

