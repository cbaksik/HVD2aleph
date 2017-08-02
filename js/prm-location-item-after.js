/**
 * Created by samsan on 7/18/17.
 */
angular.module('viewCustom')
    .controller('prmLocationItemAfterCtrl',['$element','customService',function ($element, customService) {
        var vm=this;
        vm.currLoc={};
        vm.locationInfo={};
        vm.parentData={};
        vm.itemsCategory=[{'itemcategorycode':'02','itemstatusname':'Not checked out','processingstatus':'','queue':''}]; // json data object from getItemCategoryCodes ajax call
        vm.logicList=[]; // store logic list from the xml file
        vm.requestLinks=[];
        var sv=customService;

        // get static xml data and convert to json
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
          }
        };

        // get item category code
        vm.getItemCategoryCodes=function () {
           var url=vm.parentData.opacService.restBaseURLs.ILSServicesBaseURL + '/holdings';
           var jsonObj={'filters':{'callnumber':'','collection':'','holid':'',ilsRecordList:[{'institution':'HVD','recordId':''}],'noItem':6,'startPos':1,'sublibrary':'WID','sublibs':'WID','vid':'HVD2'},'locations':[]};
           jsonObj.filters.holid=vm.currLoc.location.holdId;
           jsonObj.filters.vid=vm.parentData.locationsService.vid;
           jsonObj.filters.noItem=vm.parentData.locationsService.noItems;
           jsonObj.filters.sublibrary=vm.currLoc.location.mainLocation;
           jsonObj.filters.sublibs=vm.currLoc.location.mainLocation;
           jsonObj.filters.ilsRecordList[0].institution=vm.currLoc.location.organization;
           jsonObj.filters.ilsRecordList[0].recordId=vm.currLoc.location.ilsApiId;
           jsonObj.locations.push(vm.currLoc.location);
           sv.postAjax(url,jsonObj).then(function (result) {
               if(result.data.locations) {
                   vm.itemsCategory = result.data.locations;
                   vm.compare();
               }
           },
            function (err) {
                console.log(err);
            }
           );

        };

        // make comparison to see it is true so it can display the link
        vm.compare=function () {
            // get requestItem
            if(vm.locationInfo.requestItem) {
              var requestItem={'flag':false,'item':{},'type':'requestItem','text':'Request Item'};

              for (var i = 0; i < vm.locationInfo.requestItem[0].json.length; i++) {
                  var json=vm.locationInfo.requestItem[0].json[i];

                  for(var j=0; j < vm.itemsCategory.length; j++) {
                      var itemCat=vm.itemsCategory[j].items;

                      for(var w=0; w < itemCat.length; w++) {
                          var item=itemCat[w];

                          var itemCategoryCodeList='';
                          if(json._attr.itemcategorycode) {
                              itemCategoryCodeList = json._attr.itemcategorycode._value;
                              itemCategoryCodeList = itemCategoryCodeList.toString();
                          }
                          var itemStatusNames='';
                          if(json._attr.itemstatusname) {
                              itemStatusNames = json._attr.itemstatusname._value;
                          }
                          var processingStatusList='';
                          if(json._attr.processingstatus){
                              processingStatusList=json._attr.processingstatus._value;
                          }
                          var queueList='';
                          if(json._attr.queue) {
                              queueList=json._attr.queue._value;
                          }

                          if(itemCategoryCodeList) {
                              var patternCategoryCode=new RegExp(item.itemcategorycode);
                              if(patternCategoryCode.test(itemCategoryCodeList)) {
                                  var patternStatusName=new RegExp(item.itemstatusname);
                                  if(patternStatusName.test(itemStatusNames)) {
                                      if(processingStatusList==='NULL' && item.processingstatus==='') {
                                          requestItem.flag=true;
                                          requestItem.item=item;
                                          i = vm.locationInfo.requestItem[0].json.length;
                                      } else if(processingStatusList && item.processingstatus) {
                                          var patternProcessStatus=new RegExp(item.processingstatus);
                                          if(patternProcessStatus.test(processingStatusList)) {
                                              requestItem.flag=true;
                                              requestItem.item=item;
                                              i = vm.locationInfo.requestItem[0].json.length;
                                          }
                                      }
                                  }
                              }
                          }
                      }
                  }

              }
              // push to array
              vm.requestLinks.push(requestItem);
            }
            // scan & delivery
            if(vm.locationInfo.scanDeliver) {
                var scanDeliver={'flag':false,'item':{},'type':'scanDeliver','text':'Scan & Delivery'};
                for(var i=0; i < vm.locationInfo.scanDeliver[0].json.length; i++){
                    var json=vm.locationInfo.scanDeliver[0].json[i];
                    for(var j=0; j < vm.itemsCategory.length; j++) {
                        var itemCat=vm.itemsCategory[j].items;

                        for(var w=0; w < itemCat.length; w++) {
                            var item=itemCat[w];

                            var itemCategoryCodeList='';
                            if(json._attr.itemcategorycode) {
                                itemCategoryCodeList = json._attr.itemcategorycode._value;
                                itemCategoryCodeList = itemCategoryCodeList.toString();
                            }
                            var itemStatusNames='';
                            if(json._attr.itemstatusname) {
                                itemStatusNames = json._attr.itemstatusname._value;
                            }
                            var processingStatusList='';
                            if(json._attr.processingstatus){
                                processingStatusList=json._attr.processingstatus._value;
                            }
                            var queueList='';
                            if(json._attr.queue) {
                                queueList=json._attr.queue._value;
                            }

                            if(itemCategoryCodeList) {
                                var patternCategoryCode=new RegExp(item.itemcategorycode);
                                if(patternCategoryCode.test(itemCategoryCodeList)) {
                                    var patternStatusName=new RegExp(item.itemstatusname);
                                    if(patternStatusName.test(itemStatusNames)) {
                                        if(processingStatusList==='NULL' && item.processingstatus==='') {
                                            scanDeliver.flag=true;
                                            scanDeliver.item=item;
                                            i = vm.locationInfo.scanDeliver[0].json.length;
                                        } else if(processingStatusList && item.processingstatus) {
                                            var patternProcessStatus=new RegExp(item.processingstatus);
                                            if(patternProcessStatus.test(processingStatusList)) {
                                                scanDeliver.flag=true;
                                                scanDeliver.item=item;
                                                i = vm.locationInfo.scanDeliver[0].json.length;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // push to array
                vm.requestLinks.push(scanDeliver);
            }
            // get aeonrequest
            if(vm.locationInfo.aeonrequest) {
                var aeonrequest={'flag':false,'item':{},'type':'aeonrequest','text':'Schedule visit'};
                for(var i=0; i < vm.locationInfo.aeonrequest[0].json.length; i++){
                    var json=vm.locationInfo.aeonrequest[0].json[i];
                    for(var j=0; j < vm.itemsCategory.length; j++) {
                        var itemCat=vm.itemsCategory[j].items;

                        for(var w=0; w < itemCat.length; w++) {
                            var item=itemCat[w];

                            var itemCategoryCodeList='';
                            if(json._attr.itemcategorycode) {
                                itemCategoryCodeList = json._attr.itemcategorycode._value;
                                itemCategoryCodeList = itemCategoryCodeList.toString();
                            }
                            var itemStatusNames='';
                            if(json._attr.itemstatusname) {
                                itemStatusNames = json._attr.itemstatusname._value;
                            }
                            var processingStatusList='';
                            if(json._attr.processingstatus){
                                processingStatusList=json._attr.processingstatus._value;
                            }
                            var queueList='';
                            if(json._attr.queue) {
                                queueList=json._attr.queue._value;
                            }

                            if(itemCategoryCodeList) {
                                var patternCategoryCode=new RegExp(item.itemcategorycode);
                                if(patternCategoryCode.test(itemCategoryCodeList)) {
                                    var patternStatusName=new RegExp(item.itemstatusname);
                                    if(patternStatusName.test(itemStatusNames)) {
                                        if(processingStatusList==='NULL' && item.processingstatus==='') {
                                            aeonrequest.flag=true;
                                            aeonrequest.item=item;
                                            i = vm.locationInfo.aeonrequest[0].json.length;
                                        } else if(processingStatusList && item.processingstatus) {
                                            var patternProcessStatus=new RegExp(item.processingstatus);
                                            if(patternProcessStatus.test(processingStatusList)) {
                                                aeonrequest.flag=true;
                                                aeonrequest.item=item;
                                                i = vm.locationInfo.aeonrequest[0].json.length;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // push to array
                vm.requestLinks.push(aeonrequest);
            }

            console.log('*** vm.requestLinks ***');
            console.log(vm.requestLinks);
        };

        vm.$onInit=function () {
            vm.getLibData();
            console.log('*** OnInit ****');
            console.log(vm);
        };

        vm.$onChanges=function (ev) {
            // get data from prm-location-items-after component
            vm.data=sv.getItems();
            vm.currLoc=vm.data.currLoc;
            // get data from prm-locations-after component
            vm.parentData=sv.getParentData();

            vm.getItemCategoryCodes();

            console.log('*** onChanges ***');
            console.log(vm);
        };

        vm.$doCheck=function () {
           
            console.log('**** doCheck ****');
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