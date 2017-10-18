/**
 * Created by samsan on 7/18/17.
 * This component read xml data from a file and store them into a service to use it prm-location-item-after component.
 * When a user click on each item, it capture the each location and pass into a service component
 */
angular.module('viewCustom')
    .controller('prmLocationItemsAfterCtrl',['customService','$element','$timeout','$window','$sce',function (customService, $element, $timeout, $window, $sce) {
        var vm=this;
        var sv=customService;
        vm.libName='';
        vm.logicList=[];
        vm.removeFlag=true;
        // get static xml data and convert to json
        vm.getLibData=function () {
            sv.getAjax('/primo-explore/custom/HVD2/html/requestLinkLogic.html', {}, 'get')
                .then(function (respone) {
                    if (respone.status === 200) {
                        vm.logicList = sv.convertXML(respone.data);
                        sv.setLogicList(vm.logicList);
                    }
                }, function (err) {
                    console.log(err);
                })

        };

        // remove add note section native
        vm.removeDom=function () {
            var el=$element[0].parentNode.children[1].children[0].children;
            if(el) {
                if (el.length > 2) {
                    el[2].remove();
                }
            }
        };

        vm.goPlace=function(loc,e){
            e.stopPropagation();
            var url='http://nrs.harvard.edu/urn-3:hul.ois:' + loc.mainLocation;
            $window.open(url,'_blank');
            return true;
        };

        vm.$onInit=function() {
           vm.getLibData();
        };

        vm.$doCheck=function() {
            if(vm.parentCtrl.loc) {
                if (vm.parentCtrl.loc.locationNoItems && vm.removeFlag) {
                    var el = $element[0].parentNode.children;
                    if (el.length > 2) {
                        el[2].remove();
                        vm.removeFlag=false;
                    }
                }
            }
            vm.removeDom();
            sv.setItems(vm.parentCtrl);

            //remove network resource
            if(vm.parentCtrl.locationsService.results) {
                for(var i=0; i < vm.parentCtrl.locationsService.results[0].length; i++) {
                    if(vm.parentCtrl.locationsService.results[0][i].location.libraryCode==='HVD_NET') {
                        vm.parentCtrl.locationsService.results[0].splice(i,1);
                    }
                }
            }
        };

    }]);

angular.module('viewCustom')
    .component('prmLocationItemsAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmLocationItemsAfterCtrl',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-location-items-after.html'
    });

// create href link if there is url for online section
angular.module('viewCustom').filter('urlFilter',['$filter',function ($filter) {
    return function (str,key) {
        var newStr='';
        var translateKey=$filter('translate')(key);
        if(translateKey.toLowerCase()==='online:') {
            var strList=str.split(';');
            var pattern=/^(http:\/\/)/;
            if(strList.length > 1) {
                var str1=strList[0];
                var str2=strList[1];
                if(pattern.test(str2)){
                    newStr=str1 + '; <a href="'+str2+'" target="_blank">'+str2+'</a>';
                } else if(pattern.test(str1)) {
                    newStr='<a href="'+str1+'" target="_blank">'+str1+'</a>' +'; ' + str2;
                } else {
                    newStr=str;
                }
            } else {
                if(pattern.test(str)) {
                    newStr='<a href="'+str+'" target="_blank">'+str+'</a>';
                } else {
                    newStr = str;
                }
            }
        } else {
            newStr=str;
        }
        return newStr;
    }

}]);