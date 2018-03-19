/**
 * Created by samsan on 7/18/17.
 * This component is using to build Request Item, Scan & Delivery, and Schedule visit link.
 * It pass the current location data to get a full list of current location with itemcategorycode.
 * Then compare it with xml logic data file
 */
angular.module('viewCustom')
    .controller('prmLocationItemAfterCtrl',['customService','$window','$scope','$element','$compile','$timeout','$filter',function (customService, $window, $scope, $element, $compile, $timeout, $filter) {
        var vm=this;
        vm.currLoc={};
        vm.locationInfo={};
        vm.parentData={};
        vm.itemsCategory=[{'itemcategorycode':'02','itemstatusname':'Not checked out','processingstatus':'','queue':''}]; // json data object from getItemCategoryCodes ajax call
        vm.logicList=[]; // store logic list from the xml file
        vm.requestLinks=[];
        vm.auth={};
        var startIndex = 0;
        var flagAjax = true;
        var sv=customService;
        // get item category code, the item category code does not exist in currloc item.
        vm.getItemCategoryCodes=function () {
            let prmLocationItems = document.getElementsByTagName('prm-location-items')[0];
            let mdList = prmLocationItems.querySelector('md-list');
            let items = mdList.querySelectorAll('md-list-item');

            // current md-listi-item when a user click on it
            let mdListItem=$element[0].parentNode;

            // loop it through to get index
            for(let i=0; i < items.length; i++) {
                let item = items[i];
                if(item===mdListItem) {
                    startIndex = i + 1;
                }
            }

           if(vm.parentData.opacService && vm.currLoc.location) {
               var url = vm.parentData.opacService.restBaseURLs.ILSServicesBaseURL + '/holdings';
               var jsonObj = {
                   'filters': {
                       'callnumber': '',
                       'collection': '',
                       'holid': '',
                       ilsRecordList: [{'institution': 'HVD', 'recordId': ''}],
                       'noItem': startIndex + 1,
                       'startPos': startIndex,
                       'sublibrary': 'WID',
                       'sublibs': 'WID',
                       'vid': 'HVD2'
                   },
                   'locations': []
               };
               jsonObj.filters.holid = vm.currLoc.location.holdId;
               jsonObj.filters.vid = vm.parentData.locationsService.vid;
               jsonObj.filters.noItem = 1;
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
            // get the index of the element
            var index = 0;

            var requestLinks=[];
            // get requestItem
            if(vm.locationInfo.requestItem) {
                var flag=true;
                var auth=sv.getAuth();
                if(auth.isLoggedIn) {
                    flag=false;
                }
               let dataList=sv.getRequestLinks(vm.locationInfo.requestItem[0].json,itemsCategory,'requestItem','Request Item',index, flag);
               requestLinks.push(dataList);
            }
            // get scan & deliver link
            if(vm.locationInfo.scanDeliver) {
                let dataList=sv.getRequestLinks(vm.locationInfo.scanDeliver[0].json,itemsCategory,'scanDeliver','Scan & Deliver',index,true);
                requestLinks.push(dataList);
            }
            // get schedule visit link
            if(vm.locationInfo.aeonrequest) {
                let dataList=sv.getRequestLinks(vm.locationInfo.aeonrequest[0].json,itemsCategory,'aeonrequest','Request Item',index,true);
                requestLinks.push(dataList);
            }
            
            return requestLinks;
        };


        vm.$onInit=function () {
            if(vm.parentCtrl) {
                vm.currLoc=vm.parentCtrl.currLoc;
            }
            // get rest url so it can make ajax call to get item category code. The itemcategorycode is numbers.
            vm.parentData=sv.getParentData();

            // watch for variable change, then call an ajax to get current location of itemcategorycode
            // it won't work on angular 2
            $scope.$watch('vm.currLoc.items',function () {
                if(vm.currLoc){
                    vm.locationInfo=sv.getLocation(vm.currLoc);
                    if(vm.currLoc.items) {
                        // remove booking request and photo copy request
                        for(var k=0; k < vm.currLoc.items.length; k++) {
                            if(vm.currLoc.items[k].listOfServices) {
                                for (var i = 0; i < vm.currLoc.items[k].listOfServices.length; i++) {
                                    if (vm.currLoc.items[k].listOfServices[i].type === 'BookingRequest' || vm.currLoc.items[k].listOfServices[i].type === 'PhotocopyRequest') {
                                        vm.currLoc.items[k].listOfServices.splice(i, 1);
                                    }
                                }
                            }
                        }
                    }

                    // set delay time so it can access the dom after angular rendering
                    setTimeout(()=>{
                        vm.getItemCategoryCodes();
                    },1000);

                }
            });
        };

        // get ajax data from prm-location-items-after.js
        vm.$doCheck=function () {
            vm.logicList = sv.getLogicList();
            vm.auth = sv.getAuth();

        };


        vm.signIn=function () {
            var auth=sv.getAuth();
            var url='/primo-explore/login?from-new-ui=1&authenticationProfile='+auth.authenticationMethods[0].profileName+'&search_scope=default_scope&tab=default_tab';
            url+='&Institute='+auth.authenticationService.userSessionManagerService.userInstitution+'&vid='+auth.authenticationService.userSessionManagerService.vid;
            url+='&targetURL='+encodeURIComponent($window.location.href);
            $window.location.href=url;
        };

        // link to other web sites
        vm.goto=function (data) {
            var url='';
            var itemrecordid='';
            var itemSequence='';
            // split itemrecordit to get docNumber and ItemSequence to build url
            if(data.item.itemrecordid) {
                var itemid=data.item.itemrecordid;
                if(itemid.length > 14) {
                    itemrecordid=itemid.substring(5,14);
                    itemSequence=itemid.substring(itemid.length - 6,itemid.length)
                }
            }

            if(data.type==='scanDeliver') {
                url='http://sfx.hul.harvard.edu/hvd?sid=HOLLIS:ILL&pid=DocNumber='+itemrecordid+',ItemSequence='+itemSequence+'&sfx.skip_augmentation=1';
                $window.open(url,'_blank');
            } else if(data.type==='aeonrequest') {
                url='http://sfx.hul.harvard.edu/hvd?sid=HOLLIS:AEON&pid=DocNumber='+itemrecordid+',ItemSequence='+itemSequence+'&sfx.skip_augmentation=1';
                $window.open(url,'_blank');
            } else if(data.type==='requestItem' && vm.auth.isLoggedIn===false) {
                // redirect to login for requestItem if a user is not login
                vm.signIn();
            }
        };

        // add keypress on a link
        vm.keypressGoto=function (e,data) {
            if(e.which===13) {
                vm.goto(data);
            }

        };

    }]);


angular.module('viewCustom')
    .component('prmLocationItemAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationItemAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-location-item-after.html'
    });

