/**
 * Created by samsan on 8/16/17.
 */


angular.module('viewCustom')
    .controller('prmActionContainerAfterCtrl',['customService','prmSearchService','$window','$q',function (customService,prmSearchService,$window,$q) {

        var cisv=customService;
        var cs=prmSearchService;
        var vm=this;
        vm.restsmsUrl='';
        vm.parentData={};
        vm.holding=[];
        vm.locations=[];
        vm.form={'phone':'','deviceType':'','body':'','subject':'SMS from Harvard Library','error':'','mobile':false,'msg':''};

        // get rest endpoint Url
        vm.getUrl=function () {
            cisv.getAjax('/primo-explore/custom/HVD2/html/config.html','','get')
                .then(function (res) {
                        vm.restsmsUrl=res.data.smsUrl;
                    },
                    function (error) {
                        console.log(error);
                    }
                )
        };

        // get the library location name
        vm.getLibraryNames=function () {
            vm.locations=[];
            var url='';
            var qList=[];
            if(vm.parentData.opacService) {
                url = vm.parentData.opacService.restBaseURLs.ILSServicesBaseURL+'/holdings';
                var paramList=[];
                for(var i=0; i < vm.holding.length; i++) {
                    var params={'filters':{'callnumber':'','collection':'','holid':'','vid':'HVD2','sublibs':'','sublibrary':'',
                        'ilsRecordList':[{'institution':'HVD','recordId':''}]},'locations':''};
                    var data=vm.holding[i];
                    params.filters.holid=data.holdId;
                    params.filters.vid=data.organization;
                    params.filters.ilsRecordList[0].institution=data.organization;
                    params.filters.ilsRecordList[0].recordId=data.ilsApiId;
                    params.filters.sublibs=data.mainLocation;
                    params.filters.sublibrary=data.mainLocation;
                    params.locations = [data];

                    paramList[i]=params;
                    qList[i]=cisv.postAjax(url,paramList[i]);

                }

                var ajaxList = $q.all(qList);
                ajaxList.then(
                    function (result) {
                        if(result) {
                            for (var i = 0; i < result.length; i++) {
                                var data = result[i].data;
                                var loc=data.locations[0];
                                loc.cssClass='textsms-row';
                                vm.locations.push(loc);
                            }
                        }
                    },
                    function (error) {
                        console.log(error);
                    }
                )

            }
        };

        vm.$onInit=function() {
            // get rest sms endpoint url from config.text file
            vm.getUrl();
            // check if a user is using mobile phone or laptop browser
            vm.form.deviceType=cs.getPlatform();
            if(vm.form.deviceType) {
                vm.form.mobile=true;
            } else {
                vm.form.deviceType=cs.getBrowserType();
            }

            vm.holding=vm.parentCtrl.item.delivery.holding;
            vm.parentData=cisv.getParentData();
            vm.getLibraryNames();

        };

        vm.$doCheck=function(){
            // get action name when a user click on each action list
            var actionName=cisv.getActionName();
            if(actionName && vm.parentCtrl.actionName !== 'none') {
                vm.parentCtrl.actionName=actionName;
            } else if(actionName==='textsms') {
                vm.parentCtrl.actionName=actionName;
            }

        };

        // this function is trigger only if a user is using laptop computer
        vm.sendText=function (k,loc) {
            // reset the row css class
            for(var i=0; i < vm.locations.length; i++) {
                vm.locations[i].cssClass='textsms-row';
            }
            // set select row highlite
            vm.locations[k].cssClass='textsms-row-visited';

            vm.form.error='';
            vm.form.msg='';
            var count=0;
            if(!vm.form.phone) {
                vm.form.error = 'Enter your phone number';
                count++;
            } else if(isNaN(vm.form.phone) || vm.form.phone.length < 10) {
                vm.form.error = 'Enter a valid phone number';
                count++;
            }

            vm.form.body=loc.mainlocationname + ' ' + loc.callnumber;
            if(count===0) {
                if (vm.form.mobile) {
                    var url = 'sms:' + vm.form.phone + '&body=' + vm.form.body;
                    $window.open(url, '_blank');
                } else {
                    cisv.postAjax( vm.restsmsUrl, vm.form).then(function (result) {
                            console.log('**** result ***');
                            console.log(result);
                            console.log(result.data);

                            if(result.status===200) {
                               var data=JSON.parse(result.data.msg);
                               data=data.data.message[0];
                               if(data.accepted) {
                                   vm.form.msg='The message is sent to '+ data.to +'. Message Id: ' + data.apiMessageId;
                               } else {
                                   vm.form.msg=result.data.msg;
                               }
                               console.log('*** msg ****');
                               console.log(vm.form.msg);

                            } else {
                                vm.form.msg='There is a technical issue with Text Message Server. Please try it later on.';
                            }
                        }, function (error) {
                            console.log(error);
                        }
                    )

                }
            }
        };

    }]);


angular.module('viewCustom')
    .component('prmActionContainerAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmActionContainerAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-action-container-after.html'
    });
