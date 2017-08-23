/**
 * Created by samsan on 8/16/17.
 */


angular.module('viewCustom')
    .controller('prmActionContainerAfterCtrl',['customService','prmSearchService','$window','$q',function (customService,prmSearchService,$window,$q) {

        var cisv=customService;
        var cs=prmSearchService;
        var vm=this;
        vm.parentData={};
        vm.holding=[];
        vm.locations=[];
        vm.form={'phone':'','deviceType':'','body':'','subject':'SMS from Harvard Library','error':'','mobile':false,'msg':''};
     
        vm.getLibraryNames=function () {
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
                                vm.locations.push(data.locations);
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

            console.log('*** prm-action-container-after ***');
            console.log(vm);

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
        vm.sendText=function (loc) {
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
                    var url = 'http://52.201.96.131:8080/sendsms';
                    //var url = 'http://localhost:8080/sendsms';
                    cisv.postAjax(url, vm.form).then(function (result) {
                            console.log('*** result ***');
                            console.log(result);
                            if(result.status===200) {
                               vm.form.msg=result.data.msg;
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
