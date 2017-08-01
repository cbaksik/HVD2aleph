/**
 * Created by samsan on 7/18/17.
 */
angular.module('viewCustom')
    .controller('prmLocationItemAfterCtrl',['$element','customService',function ($element, customService) {
        var vm=this;
        vm.currLoc={};
        vm.locationInfo={};
        vm.logicList=[]; // store logic list from the xml file
        vm.requestLinks={'requestItem':false,'scanDeliver':false,'aeonRequest':false};
        var sv=customService;

        vm.getLibData=function () {
          vm.logicList = sv.getLogicList();
          if(vm.logicList.length===0) {
              sv.getAjax('/primo-explore/custom/HVD2/lib/requestLinkLogic.xml', {}, 'get')
                  .then(function (respone) {
                      if (respone.status === 200) {
                          var data = sv.convertXML(respone.data);
                          if (data.requestlinkconfig) {
                              vm.logicList = data.requestlinkconfig[0];
                              sv.setLogicList(vm.logicList);
                              vm.locationInfo = sv.getLocation(vm.currLoc);
                          } else {
                              console.log('*** It cannot access requestlinkconfig data ***');
                              console.log(data);
                          }
                      }
                  }, function (err) {
                      console.log(err);
                  })
          } else {
              vm.locationInfo = sv.getLocation(vm.currLoc);
              vm.locationInfo = sv.getLocation(vm.currLoc);
          }
        };

        vm.$onInit=function () {
            vm.getLibData();
        };

        vm.$onChanges=function (ev) {
            vm.data=sv.getItems();
            vm.currLoc=vm.data.currLoc;

            console.log('*** prm-location-item-after ***');
            console.log(vm);


        };

        vm.goto=function (index) {
            console.log('*** goto ***');
            console.log(index)
        }

    }]);


angular.module('viewCustom')
    .component('prmLocationItemAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationItemAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-location-item-after.html'
    });