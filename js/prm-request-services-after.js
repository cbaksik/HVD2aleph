/* Author: Sam San
 It hide Request Item link under GET IT section after a user login
*/

angular.module('viewCustom')
    .component('prmRequestServicesAfter',{
        bindings:{parentCtrl:'<'},
        controllerAs:'vm',
        controller: 'prmRequestServicesAfterCtrl'
    });


angular.module('viewCustom')
    .controller('prmRequestServicesAfterCtrl',['$element','customService',function ($element,customService) {
        let vm=this;
        let cs=customService;

        vm.$onInit=()=> {
            setTimeout(()=>{
                let auth=cs.getAuth();
                // if a user login, hide the request item link under GET IT
                if(auth.isLoggedIn) {
                    let el = $element[0].parentNode.childNodes[1];
                    if (el) {
                        el.style.display = 'none';
                    }
                }
            },1500);

        };


    }]);

