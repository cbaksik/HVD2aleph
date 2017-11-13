/**
 * Created by samsan on 11/13/17.
 */

angular.module('viewCustom')
    .controller('prmBrowseSearchBarAfterCtrl',['$element','$compile','$scope','$location',function ($element,$compile,$scope,$location) {
        var vm=this;
        vm.$onChanges=function () {
            // insert Basic Search button to the right of search bar
            var el=$element[0].parentNode.children[0].children[2];
            if(el) {
                var btnNode=document.createElement('button');
                btnNode.setAttribute('class','md-button simple-btn');
                btnNode.setAttribute('ng-click','vm.gotoSimple()');
                var textNode=document.createTextNode('Basic search');
                btnNode.appendChild(textNode);
                el.appendChild(btnNode);
                // refresh the dom
                $compile(el)($scope);
            }
        };

        // go back to simple search
        vm.gotoSimple=function () {
            $location.path('/search');
        }

    }]);

angular.module('viewCustom')
    .component('prmBrowseSearchBarAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmBrowseSearchBarAfterCtrl',
        controllerAs:'vm'
    });

