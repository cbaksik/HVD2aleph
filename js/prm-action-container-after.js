/**
 * Created by samsan on 8/16/17.
 */


angular.module('viewCustom')
    .controller('prmActionContainerAfterCtrl',['customService','prmSearchService',function (customService,prmSearchService) {

        var cisv=customService;
        var cs=prmSearchService;
        var vm=this;
        vm.locations=[];
        vm.form={'phone':'','deviceType':'','body':'','subject':'SMS from Harvard Library','error':'','mobile':false};

        vm.$onInit=function() {
            // check if a user is using mobile phone or laptop browser
            vm.form.deviceType=cs.getPlatform();
            if(vm.form.deviceType) {
                vm.form.mobile=true;
            } else {
                vm.form.deviceType=cs.getBrowserType();
            }

            console.log('*** prm-action-container-after  ***');
            console.log(vm);

        };

        vm.$doCheck=function(){
            // get action name when a user click on each action list
            var actionName=cisv.getActionName();
            if(actionName) {
                vm.parentCtrl.actionName=actionName;
            }
            var textData=cisv.getTextData();
            if(textData.locations) {
                vm.locations=textData.locations;
            }
            if(vm.form.phone) {
                vm.form.error='';
            }
            console.log(vm.form.phone);

        };

        // this function is trigger only if a user is using laptop computer
        vm.sendText=function (loc) {
            console.log(loc);
            vm.form.body=loc.additionalData.mainlocationname + ' ' + loc.additionalData.callnumber;
            console.log(vm.form);
            vm.form.error='';
            if(!vm.form.phone) {
                vm.form.error='Enter your phone number';
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
        };

    }]);


angular.module('viewCustom')
    .component('prmActionContainerAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmActionContainerAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-action-container-after.html'
    });

