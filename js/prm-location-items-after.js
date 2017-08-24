/**
 * Created by samsan on 7/18/17.
 * This component read xml data from a file and store them into a service to use it prm-location-item-after component.
 * When a user click on each item, it capture the each location and pass into a service component
 */
angular.module('viewCustom')
    .controller('prmLocationItemsAfterCtrl',['customService','$element','$window','$compile','$scope',function (customService,$element,$window,$compile,$scope) {
        var vm=this;
        var sv=customService;
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

        vm.$onInit=function() {
           vm.getLibData();
        };

        vm.$onChanges=function (ev) {
            // capture data and use it in prm-location-item-after component
            sv.setItems(vm.parentCtrl);
            // add place icon if the location has only one
            if(vm.parentCtrl.locationsService.results) {
                if (vm.parentCtrl.locationsService.results[0].length === 1) {
                    var el = $element[0].parentNode.children[1].children[0];
                    var mdIcon = document.createElement('md-icon');
                    mdIcon.setAttribute('md-svg-src', '/primo-explore/custom/HVD2/img/place.svg');
                    mdIcon.setAttribute('class', 'placeIcon');
                    mdIcon.setAttribute('ng-click', '$ctrl.goPlace($ctrl.parentCtrl.currLoc.location,$event)');
                    if (el.className !== 'placeIcon') {
                        el.prepend(mdIcon);
                        $compile(el)($scope);
                    }
                }
            }

        };

        vm.goPlace=function (loc,e) {
            e.stopPropagation();
            var url='http://nrs.harvard.edu/urn-3:hul.ois:' + loc.mainLocation;
            window.open(url,'_blank');
            return true;
        }



    }]);


angular.module('viewCustom')
    .component('prmLocationItemsAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationItemsAfterCtrl'
    });
