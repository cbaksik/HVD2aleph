/**
 * Created by samsan on 7/18/17.
 * This component read xml data from a file and store them into a service to use it prm-location-item-after component.
 * When a user click on each item, it capture the each location and pass into a service component
 */
angular.module('viewCustom')
    .controller('prmLocationItemsAfterCtrl',['customService','$element','$window','$compile','$scope','$timeout',function (customService,$element,$window,$compile,$scope, $timeout) {
        var vm=this;
        var sv=customService;
        vm.libraryName='';
        vm.logicList=[];
        // get static xml data and convert to json
        vm.getLibData=function () {
            sv.getAjax('/primo-explore/custom/HVD2/html/requestLinkLogic.html', {}, 'get')
                .then(function (respone) {
                    if (respone.status === 200) {
                        vm.logicList = sv.convertXML(respone.data);
                        sv.setLogicList(vm.logicList);
                    }
                }, function (err) {
                    console.log(err);
                })

        };


        vm.$doCheck=function() {
            // re-align place icon when a user click on location item
            var el=$element[0].parentNode.children[1].children[0];
            if(el) {
                var child=el.children[0];
                if(child && child.className.includes('placeIcon')) {
                    var text=el.children[1].innerText;
                    var width=text.length * 10;
                    if(text.length <= 8) {
                        width+=10;
                    } else if(text.length > 25) {
                        width=text.length * 8;
                    }
                    el.children[0].setAttribute('style','left:'+width+'px');
                }
            }
        };

        vm.$onInit=function() {
           vm.getLibData();
        };

        vm.$onChanges=function () {
            // capture data and use it in prm-location-item-after component
            sv.setItems(vm.parentCtrl);
            // insert place icon and align it
            if(vm.parentCtrl.locationsService.results) {
                if (vm.parentCtrl.locationsService.results[0].length > 0) {
                    var el = $element[0].parentNode.children[1].children[0];
                    var mdIcon = document.createElement('md-icon');
                    mdIcon.setAttribute('md-svg-src', '/primo-explore/custom/HVD2/img/place.svg');
                    mdIcon.setAttribute('class', 'placeIcon');
                    mdIcon.setAttribute('ng-click', '$ctrl.goPlace($ctrl.parentCtrl.currLoc.location,$event)');
                    if (el.className !== 'placeIcon') {
                        $timeout(function () {
                            var text = el.children[0].innerText;
                            var width = text.length * 10;
                            if(text.length <= 8) {
                                width+=10;
                            } else if(text.length > 25) {
                                width=text.length * 8;
                            }
                            mdIcon.setAttribute('style','left:'+width+'px');
                            el.prepend(mdIcon);
                            $compile(el)($scope);

                        },500);

                    }
                }
            }

        };

        vm.goPlace=function (loc,e) {
            e.stopPropagation();
            var url='http://nrs.harvard.edu/urn-3:hul.ois:' + loc.mainLocation;
            $window.open(url,'_blank');
            return true;
        }



    }]);


angular.module('viewCustom')
    .component('prmLocationItemsAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationItemsAfterCtrl'
    });
