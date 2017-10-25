/**
 * Created by samsan on 10/23/17.
 */

angular.module('viewCustom')
    .controller('customLibraryMapCtrl',['customService',function (customService) {
        var vm=this;
        var sv=customService;
        vm.api=sv.getApi();
        vm.mapLocData={};

        vm.getMapIt=function () {
            if(vm.loc) {
                let url = vm.api.mapUrl + '/' + vm.loc.mainLocation;
                url += '/' + vm.loc.subLocationCode + '?callNumber=' + encodeURI(vm.loc.callNumber);
                sv.getAjax(url,'','get').then(
                    function (result) {
                        vm.mapLocData=result.data;
                    },
                    function (error) {
                        console.log(error);
                    }
                )
            }
        };

        vm.$onInit=function() {
           vm.api=sv.getApi();
           vm.getMapIt();
        };
    }]);

angular.module('viewCustom')
    .component('customLibraryMap',{
        bindings:{loc:'<'},
        controller: 'customLibraryMapCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/custom-library-map.html'
    });


// map letter to specific word in floor
angular.module('viewCustom').filter('mapFilter',[function () {
    return function (str) {
        var newStr='';
        if(str.length===2) {
            var loc=str.substring(0,1);
            var loc2=str.substring(1,str.length);
            newStr='Floor ' + loc;
            if(loc2==='E') {
                newStr+=' East Row ';
            } else if(loc2==='W') {
                newStr+=' West Row ';
            } else if(loc2==='N') {
                newStr+=' North Row ';
            } else if(loc2==='S') {
                newStr+=' South Row ';
            }
        } else if(str.length===1) {
            newStr='Floor ' + str;
        } else {
            newStr=str;
        }
        return newStr;
    }

}]);


// remove 2 forward slash from the url
angular.module('viewCustom').filter('mapFilterUrl',[function () {
    return function (str) {
        var newStr='';
        if(str) {
            var urlList=str.split('//');
            if(urlList.length > 2){
                newStr=urlList[0]+'//'+urlList[1]+'/'+urlList[2];
            } else {
                newStr=str;
            }
        } else {
            newStr=str;
        }
        return newStr;
    }

}]);