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

        vm.createIcon=function () {
            // insert place icon and align it
            var el = $element[0].parentNode.parentNode.parentNode.children[1].children[0];
            vm.libName = $filter('translate')(vm.currLoc.location.libraryCode);
            if(el.children[0].tagName==='H4' && vm.libName && el) {
                el.children[0].remove();
                var h4=document.createElement('h4');
                h4.setAttribute('class','md-title');
                var span=document.createElement('span');
                span.innerText=vm.libName;
                h4.appendChild(span);
                var mdIcon = document.createElement('md-icon');
                mdIcon.setAttribute('md-svg-src', '/primo-explore/custom/HVD2/img/place.svg');
                mdIcon.setAttribute('class', 'placeIcon');
                mdIcon.setAttribute('ng-click', 'vm.goPlace(vm.currLoc.location,$event)');
                h4.appendChild(mdIcon);
                if(el.children.length > 0) {
                    el.insertBefore(h4,el.children[0]);
                    $compile(el.children[0])($scope);
                }
            }

        };

        // create map it link to library
        vm.createMapIt=function () {
            var el=$element[0].parentNode.parentNode.parentNode.children[1].children[0];
            if(el) {
                var customLibraryMap=document.createElement('custom-library-map');
                customLibraryMap.setAttribute('loc','vm.currLoc.location');
                el.appendChild(customLibraryMap);
                $compile(el)($scope);
            }
        };


        vm.goPlace=function(loc,e){
            e.stopPropagation();
            var url='http://nrs.harvard.edu/urn-3:hul.ois:' + loc.mainLocation;
            $window.open(url,'_blank');
            return true;
        };

        // make comparison to see it is true so it can display the link
        vm.compare=function (itemsCategory) {
            // get the index of the element
            var index=0;
            var el=$element[0].previousSibling.parentNode;
            if($element[0].parentNode.parentNode) {
                var md_list = $element[0].parentNode.parentNode.children[0];
                for (var i = 0; i < md_list.length; i++) {
                    if (md_list[i] === el) {
                        index = i;
                        i = md_list.length;
                    }
                }
            }

            var requestLinks=[];
            // get requestItem
            if(vm.locationInfo.requestItem) {
                var flag=true;
                var auth=sv.getAuth();
                if(auth.isLoggedIn) {
                    flag=false;
                }
               var dataList=sv.getRequestLinks(vm.locationInfo.requestItem[0].json,itemsCategory,'requestItem','Request Item',index, flag);
               requestLinks.push(dataList);
            }
            // get scan & deliver link
            if(vm.locationInfo.scanDeliver) {
                var dataList=sv.getRequestLinks(vm.locationInfo.scanDeliver[0].json,itemsCategory,'scanDeliver','Scan & Deliver',index,true);
                requestLinks.push(dataList);
            }
            // get schedule visit link
            if(vm.locationInfo.aeonrequest) {
                var dataList=sv.getRequestLinks(vm.locationInfo.aeonrequest[0].json,itemsCategory,'aeonrequest','Request Item',index,true);
                requestLinks.push(dataList);
            }

            return requestLinks;
        };


        vm.$onInit=function () {
            // watch for variable change, then call an ajax to get current location of itemcategorycode
            // it won't work on angular 2
            $scope.$watch('vm.currLoc',function () {
                vm.locationInfo=sv.getLocation(vm.currLoc);
                vm.parentData=sv.getParentData();
                vm.getItemCategoryCodes();
                vm.createIcon();
                vm.createMapIt();
            });
        };

        vm.$doCheck=function () {
            vm.data=sv.getItems();
            vm.currLoc=vm.data.currLoc;
            // remove bookingRequest and photocopy request
            if(vm.currLoc.items) {
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


        };

        vm.$onChanges=function (ev) {
            // list of logic xml data list that convert into json array
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

