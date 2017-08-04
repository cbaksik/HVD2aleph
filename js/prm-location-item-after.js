/**
 * Created by samsan on 7/18/17.
 * This component is using to build Request Item, Scan & Delivery, and Schedule visit link.
 * It pass the current location data to get a full list of current location with itemcategorycode.
 * Then compare it with xml logic data file
 */
angular.module('viewCustom')
    .controller('prmLocationItemAfterCtrl',['customService','$window','$scope',function (customService, $window,$scope) {
        var vm=this;
        vm.currLoc={};
        vm.locationInfo={};
        vm.parentData={};
        vm.itemsCategory=[{'itemcategorycode':'02','itemstatusname':'Not checked out','processingstatus':'','queue':''}]; // json data object from getItemCategoryCodes ajax call
        vm.logicList=[]; // store logic list from the xml file
        vm.requestLinks=[];
        var sv=customService;

        // get item category code
        vm.getItemCategoryCodes=function () {
           if(vm.parentData.opacService && vm.currLoc.location) {
               var url = vm.parentData.opacService.restBaseURLs.ILSServicesBaseURL + '/holdings';
               var jsonObj = {
                   'filters': {
                       'callnumber': '',
                       'collection': '',
                       'holid': '',
                       ilsRecordList: [{'institution': 'HVD', 'recordId': ''}],
                       'noItem': 6,
                       'startPos': 1,
                       'sublibrary': 'WID',
                       'sublibs': 'WID',
                       'vid': 'HVD2'
                   },
                   'locations': []
               };
               jsonObj.filters.holid = vm.currLoc.location.holdId;
               jsonObj.filters.vid = vm.parentData.locationsService.vid;
               jsonObj.filters.noItem = vm.parentData.locationsService.noItems;
               jsonObj.filters.sublibrary = vm.currLoc.location.mainLocation;
               jsonObj.filters.sublibs = vm.currLoc.location.mainLocation;
               jsonObj.filters.ilsRecordList[0].institution = vm.currLoc.location.organization;
               jsonObj.filters.ilsRecordList[0].recordId = vm.currLoc.location.ilsApiId;
               jsonObj.locations.push(vm.currLoc.location);
               sv.postAjax(url, jsonObj).then(function (result) {
                       if (result.data.locations) {
                           vm.itemsCategory = result.data.locations;
                           vm.requestLinks=vm.compare(vm.itemsCategory);
                       }
                   },
                   function (err) {
                       console.log(err);
                   }
               );
           }

        };

        // make comparison to see it is true so it can display the link
        vm.compare=function (itemsCategory) {
            var requestLinks=[];
            // get requestItem
            if(vm.locationInfo.requestItem) {
                // Todo
               //var dataList=sv.getRequestLinks(vm.locationInfo.requestItem[0].json,itemsCategory,'requestItem','Request Item');
               //requestLinks.push(dataList);
            }
            // get scan & deliver link
            if(vm.locationInfo.scanDeliver) {
                var dataList=sv.getRequestLinks(vm.locationInfo.scanDeliver[0].json,itemsCategory,'scanDeliver','Scan & Deliver');
                requestLinks.push(dataList);
            }
            // get schedule visit link
            if(vm.locationInfo.aeonrequest) {
                var dataList=sv.getRequestLinks(vm.locationInfo.aeonrequest[0].json,itemsCategory,'aeonrequest','Schedule visit');
                requestLinks.push(dataList);
            }
            return requestLinks;
        };

        vm.$onInit=function () {
            // watch for variable change, then call an ajax to get current location of itemcategorycode
            $scope.$watch('vm.currLoc',function () {
                vm.locationInfo=sv.getLocation(vm.currLoc);
                vm.parentData=sv.getParentData();
                vm.getItemCategoryCodes();
            });
        };

        vm.$doCheck=function () {
            vm.data=sv.getItems();
            vm.currLoc=vm.data.currLoc;
        };

        vm.$onChanges=function (ev) {
            // list of logic xml data list that convert into json array
            vm.logicList = sv.getLogicList();
        };

        // link to other web sites
        vm.goto=function (data) {
            var url='';
            var itemrecordid='';
            if(data.item.itemrecordid) {
                itemrecordid=data.item.itemrecordid;
                if(itemrecordid.length > 14) {
                    itemrecordid=itemrecordid.substring(5,14);
                }
            }
            if(data.type==='scanDeliver') {
                url='http://sfx.hul.harvard.edu/hvd?sid=HOLLIS:ILL&pid=DocNumber='+itemrecordid+',ItemSequence=000020&sfx.skip_augmentation=1';
            } else if(data.type==='aeonrequest') {
                url='http://sfx.hul.harvard.edu/hvd?sid=HOLLIS:AEON&pid=DocNumber='+itemrecordid+',ItemSequence=000080&sfx.skip_augmentation=1';
            } else if(data.type==='requestItem') {

            }

            $window.open(url,'_blank');
        }

    }]);


angular.module('viewCustom')
    .component('prmLocationItemAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationItemAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-location-item-after.html'
    });