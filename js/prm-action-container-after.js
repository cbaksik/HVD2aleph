/**
 * Created by samsan on 8/16/17.
 */


angular.module('viewCustom')
    .controller('prmActionContainerAfterCtrl',['customService','prmSearchService','hvdLibraryCodes','$window','$q',function (customService,prmSearchService,hvdLibraryCodes,$window,$q) {

        var cisv=customService;
        var cs=prmSearchService;
        var hvdCS=hvdLibraryCodes;
        var vm=this;
        vm.parentData={};
        vm.holding=[];
        vm.locations=[];
        vm.form={'phone':'','deviceType':'','body':'','subject':'SMS from Harvard Library','error':'','mobile':false};

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

            console.log('**** prm-action-container-after ***');
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

            if(vm.form.phone) {
                vm.form.error='';
            }

        };

        // this function is trigger only if a user is using laptop computer
        vm.sendText=function (loc) {
            console.log(loc);
            vm.form.body=hvdLibraryCodes.getLibraryName(loc.libraryCode) + ' ' + loc.callNumber;
            console.log(vm.form);
            vm.form.error='';

            if(vm.form.mobile) {
                var url='sms:'+vm.form.phone+'&body='+vm.form.body;

                console.log(url);
                $window.open(url,'_blank');

            } else {
                if (!vm.form.phone) {
                    vm.form.error = 'Enter your phone number';
                } else {
                    var url = 'http://localhost:8080/sendsms';
                    cisv.postAjax(url, vm.from).then(function (result) {
                            console.log('*** result ***');
                            console.log(result);
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



// library code filter
angular.module('viewCustom').filter('codefilter',['hvdLibraryCodes',function (hvdLibraryCodes) {
    return function (code) {
        var hvdService = hvdLibraryCodes;
        return hvdService.getLibraryName(code);
    }

}]);