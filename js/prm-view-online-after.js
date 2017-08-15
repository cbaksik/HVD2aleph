/**
 * Created by samsan on 5/17/17.
 * This component is to insert images into online section
 */
angular.module('viewCustom')
    .controller('prmViewOnlineAfterController', ['prmSearchService','$window','$location','customService', function (prmSearchService,$window,$location,customService) {

        var vm = this;

        var sv=prmSearchService;
        var cisv=customService;
        var auth=cisv.getAuth();
        var itemData=sv.getItem();
        vm.item=itemData.item;
        vm.searchData=itemData.searchData;
        vm.params=$location.search();
        vm.zoomButtonFlag=true;
        vm.viewAllComponetMetadataFlag=false;
        vm.singleImageFlag=false;
        vm.displayOnlineImage=false;

        vm.$onChanges=function() {
            auth=cisv.getAuth();
            vm.isLoggedIn=auth.isLoggedIn;
           // get item data from service
           itemData=sv.getItem();
           vm.item=itemData.item;
           vm.searchData=itemData.searchData;

           if(vm.item && vm.item.pnx) {
               // show image if it is HVD_VIA
               if(vm.item.pnx.control.sourceid) {
                   var sourceid=vm.item.pnx.control.sourceid;
                   if(sourceid.indexOf('HVD_VIA') !== -1) {
                       vm.displayOnlineImage = true;
                   }
               }
               if(vm.displayOnlineImage) {
                   var data = sv.getXMLdata(vm.item.pnx.addata.mis1[0]);
                   if (data.surrogate) {
                       vm.item.mis1Data = data.surrogate;
                   } else if (data.image) {
                       if (data.image.length === 1) {
                           vm.item.mis1Data = [];
                           vm.item.mis1Data.push(data);
                       } else {
                           vm.item.mis1Data = data.image;
                       }
                   } else {
                       vm.item.mis1Data = [];
                       vm.item.mis1Data.push(data);
                   }

               }
           }


           if(vm.isLoggedIn===false && vm.item.mis1Data && vm.displayOnlineImage) {
               if(vm.item.mis1Data.length===1) {
                   if (vm.item.mis1Data[0].image) {
                       if (vm.item.mis1Data[0].image[0]._attr.restrictedImage) {
                           if (vm.item.mis1Data[0].image[0]._attr.restrictedImage._value) {
                               vm.zoomButtonFlag = false;
                           }
                       }
                   } else if (vm.item.mis1Data[0]._attr) {
                       if(vm.item.mis1Data[0]._attr.restrictedImage) {
                           if (vm.item.mis1Data[0]._attr.restrictedImage._value) {
                               vm.zoomButtonFlag = false;
                           }
                       }
                   }
               }

           }

            if(vm.item.mis1Data && vm.displayOnlineImage) {
                if(vm.item.mis1Data.length==1) {
                    vm.singleImageFlag=true;
                } else {
                    vm.viewAllComponetMetadataFlag=true;
                }
            } else {
                vm.singleImageFlag=true;
            }

        };

        // view all component metadata
        vm.viewAllComponentMetaData=function () {
            var url='/primo-explore/viewallcomponentmetadata/'+vm.item.context+'/'+vm.item.pnx.control.recordid[0]+'?vid='+vm.params.vid;
            url+='&tab='+vm.params.tab+'&search_scope='+vm.params.search_scope;
            url+='&lang='+vm.params.lang;
            url+='&adaptor='+vm.params.adaptor;
            $window.open(url,'_blank');

        };


        // show the pop up image
        vm.gotoFullPhoto=function ($event, item, index) {
            // go to full display page
            var url='/primo-explore/viewcomponent/'+vm.item.context+'/'+vm.item.pnx.control.recordid[0]+'/'+index+'?vid='+vm.searchData.vid+'&lang='+vm.searchData.lang;
            if(vm.item.adaptor) {
                url+='&adaptor='+vm.item.adaptor;
            } else {
                url+='&adaptor='+(vm.searchData.adaptor?vm.searchData.adaptor:'');
            }
            $window.open(url,'_blank');
        }

    }]);


angular.module('viewCustom')
    .config(function ($stateProvider) {
        $stateProvider
            .state('exploreMain.viewallcomponentdata', {
                    url: '/viewallcomponentmetadata/:context/:docid',
                    views:{
                        '': {
                            template: `<custom-view-all-component-metadata parent-ctrl="$ctrl"></custom-view-all-component-metadata>`
                        }
                    }
                }

            )
            .state('exploreMain.viewcomponent', {
                    url:'/viewcomponent/:context/:docid/:index',
                    views:{
                        '':{
                           template:`<custom-view-component parent-ctrl="$ctrl" item="$ctrl.item" services="$ctrl.services" params="$ctrl.params"></custom-view-component>`
                        }
                    }
                }

            )
    })
    .component('prmViewOnlineAfter', {
        bindings: {parentCtrl: '<'},
        controller: 'prmViewOnlineAfterController',
        'templateUrl':'/primo-explore/custom/HVD2/html/prm-view-online-after.html'
    });





