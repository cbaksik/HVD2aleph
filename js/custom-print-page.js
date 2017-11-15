/**
 * Created by samsan on 9/5/17.
 */

angular.module('viewCustom')
    .controller('customPrintPageCtrl',['$element','$stateParams','customService','$timeout','$window','customGoogleAnalytic',function ($element,$stateParams,customService,$timeout,$window,customGoogleAnalytic) {
        var vm=this;
        var cga=customGoogleAnalytic;
        vm.item={};
        var cs=customService;
        // get item data to display on full view page
        vm.getItem=function () {
          var url=vm.parentCtrl.searchService.cheetah.restBaseURLs.pnxBaseURL+'/'+vm.context+'/'+vm.docid;
          url+='?vid='+vm.vid;
          cs.getAjax(url,'','get').then(
              function (result) {
              vm.item=result.data;
            },
            function (error) {
                console.log(error);
            }
          )

        };


        vm.$onInit=function () {
            // capture the parameter from UI-Router
            vm.docid=$stateParams.docid;
            vm.context=$stateParams.context;
            vm.vid=$stateParams.vid;
            vm.getItem();

            // initialize google analytic
            cga.init();

            $timeout(function () {
                // remove top menu and search bar
                var el=$element[0].parentNode.parentNode;

                if(el) {
                    el.children[0].remove();
                }

                var topMenu=document.getElementById('customTopMenu');
                if(topMenu) {
                    topMenu.remove();
                }

                // remove action list
                var actionList=document.getElementById('action_list');
                if(actionList) {
                    actionList.remove();
                }

                // remove right column of the page
                var el2=$element[0].children[1].children[0].children[1];
                if(el2) {
                    el2.remove();
                }

                // set google analytic page request statistic
                cga.setPage('/printPage', vm.docid);

            },1000)
        };

        vm.$postLink=function () {
            $timeout(function () {
                $window.print();
            },3000)
        }


    }]);

angular.module('viewCustom')
    .component('customPrintPage',{
        bindings:{parentCtrl:'<'},
        controller: 'customPrintPageCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/custom-print-page.html'
    });

