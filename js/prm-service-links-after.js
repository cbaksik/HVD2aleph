/**
 * Created by samsan on 8/7/17.
 */

angular.module('viewCustom')
    .controller('prmServiceLinksAfterCtrl',['customService','customImagesService','$element','$scope','$timeout',function (customService, customImagesService, $element, $scope, $timeout) {
        var vm=this;
        var sv=customService;
        var cisv=customImagesService;
        vm.itemList=[];

        vm.$onInit=function () {
            // watch for variable change from previous ajax call
            $scope.$watch('vm.parentCtrl.recordLinks',function () {
                vm.itemList=cisv.extractImageUrl(vm.parentCtrl.item, vm.parentCtrl.recordLinks);

                // remove previous link dom
                var el=$element[0].parentNode.children[0].children;
                if(vm.itemList.length > 0 && el) {
                    $timeout(function () {
                        for (var j = 0; j < el.length; j++) {
                            var obj = el[j];
                            var flag = false;
                            for (var k = 0; k < vm.itemList.length; k++) {
                                var displayLabel=vm.itemList[k].displayLabel;
                                var title=obj.textContent;
                                title=title.trim(' ');
                                displayLabel=displayLabel.trim(' ');
                                if(displayLabel===title) {
                                    flag = true;
                                    k = vm.itemList.length;
                                }
                            }
                            if (flag) {
                                // remove the top dom
                                el[j].style.display='none';
                            }
                        }
                    },200);

                }

            });
        };


    }]);


angular.module('viewCustom')
    .component('prmServiceLinksAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmServiceLinksAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-service-links-after.html'
    });

