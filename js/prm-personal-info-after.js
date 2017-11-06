/**
 * Created by samsan on 11/3/17.
 */

angular.module('viewCustom')
    .controller('prmPersonalInfoAfterCtrl',['$scope','$timeout',function ($scope,$timeout) {
        var vm=this;
        vm.$onInit=function(){
            // watch for a user to edit or view the form
            $scope.$watch('vm.parentCtrl.formMode',function () {
               // hide form when a user edit
               if(vm.parentCtrl.formMode==='Edit') {
                   $timeout(function () {
                       var inputTags = document.getElementsByTagName('input');
                       for(var i=0; i < (inputTags.length - 1); i++){
                           inputTags[i].setAttribute('type','hidden');
                       }
                   }, 500);
               }
            });
        }

    }]);

angular.module('viewCustom')
    .component('prmPersonalInfoAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmPersonalInfoAfterCtrl',
        controllerAs:'vm'
    });

