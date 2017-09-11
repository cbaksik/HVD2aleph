/**
 * Created by samsan on 8/16/17.
 */


angular.module('viewCustom')
    .controller('prmActionContainerAfterCtrl',['customService','prmSearchService','$window',function (customService,prmSearchService,$window) {

        var cisv=customService;
        var cs=prmSearchService;
        var vm=this;
        vm.restsmsUrl='';
        vm.locations=[];
        vm.form={'phone':'','deviceType':'','body':'','error':'','mobile':false,'msg':'','token':'','ip':'','sessionToken':'','isLoggedIn':false,'iat':'','inst':'','vid':'','exp':'','userName':'','iss':'','onCampus':false};

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

        vm.$onChanges=function(){
            vm.auth=cisv.getAuth();
            if(vm.auth.primolyticsService.jwtUtilService) {
                vm.form.token=vm.auth.primolyticsService.jwtUtilService.storageUtil.sessionStorage.primoExploreJwt;
                vm.form.sessionToken=vm.auth.primolyticsService.jwtUtilService.storageUtil.localStorage.getJWTFromSessionStorage;
                vm.form.isLoggedIn=vm.auth.isLoggedIn;
                // decode JWT Token to see if it is a valid token
                let obj=vm.auth.authenticationService.userSessionManagerService.jwtUtilService.jwtHelper.decodeToken(vm.form.token);
                vm.form.ip=obj.ip;
                vm.form.iss=obj.iss;
                vm.form.userName=obj.userName;
                vm.form.iat=obj.iat;
                vm.form.exp=obj.exp;
                vm.form.vid=obj.viewId;
                vm.form.inst=obj.viewInstitutionCode;
                vm.form.onCampus=obj.onCampus;

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

            vm.locations=vm.parentCtrl.item.delivery.holding;
            for(let i=0; i < vm.locations.length; i++) {
                vm.locations[i].cssClass='textsms-row';
            }

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
        vm.sendText=function (k) {
            // reset the row css class
            for(let i=0; i < vm.locations.length; i++) {
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

            // get the library name and call number
            var el=document.getElementById('smsLocation');
            if(el) {
                vm.form.body = el.children[k].innerText;
            }
            if(count===0) {
                let title='';
                if(vm.parentCtrl.item.pnx.display.title) {
                    title = vm.parentCtrl.item.pnx.display.title[0];
                    var pattern=/[:]/;
                    if(pattern.test(title)) {
                        let arr=title.split(':');
                        title=arr[0];
                        if(title.length > 30) {
                            title=title.substring(0,30);
                        }
                        title=title.trim();
                        title+='... ';
                    } else if(title.length > 30) {
                        title=title.substring(0,30);
                        title+='... ';
                    }

                    vm.form.body=title+vm.form.body;

                }

                if (vm.form.mobile) {
                    var url = 'sms:' + vm.form.phone + '&body=' + vm.form.body;
                    $window.open(url, '_blank');
                } else {
                    cisv.postAjax(vm.restsmsUrl, vm.form).then(function (result) {
                            if(result.status===200) {
                               if(result.data.status) {
                                   var data = JSON.parse(result.data.msg);
                                   data = data.data.message[0];
                                   if (data.accepted) {
                                       vm.form.msg = 'The message has been sent to ' + data.to + '.';
                                   } else {
                                       vm.form.msg = 'The message did not send. The ClickAtell did not accept sms.';
                                   }
                               } else {
                                   vm.form.msg = result.data.msg;
                               }
                            } else {
                                vm.form.msg='There is a technical issue with Text Message Server. Please try it later on.';
                            }
                        }, function (error) {
                            console.log(error);
                            vm.form.msg='There is a technical issue with Text Message Server. The rest endpoint server may be down.';
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
