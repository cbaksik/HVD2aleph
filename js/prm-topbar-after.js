/**
 * Created by samsan on 8/9/17.
 *  This component is creating white top bar, link menu on the right, and remove some doms
 */

angular.module('viewCustom')
    .controller('prmTopbarAfterCtrl',['$element','$timeout',function ($element, $timeout) {
        var vm=this;

        vm.topRightMenus=[{'title':'Research Guides','url':'http://nrs.harvard.edu/urn-3:hul.ois:portal_resguides','label':'Go to Research guides'},
            {'title':'Libraries / Hours','url':'http://nrs.harvard.edu/urn-3:hul.ois:bannerfindlib','label':'Go to Library hours'},
            {'title':'All My Accounts','url':'http://nrs.harvard.edu/urn-3:hul.ois:banneraccounts','label':'Go to all my accounts'}
        ];

        vm.$onInit=function() {
            // hide primo tab menu
            vm.parentCtrl.showMainMenu=false;
            // create new div for the top white menu
            var el=$element[0].parentNode.parentNode.parentNode.parentNode.parentNode;
            var div=document.createElement('div');
            div.setAttribute('id','customTopMenu');
            div.setAttribute('class','topMenu');
            // if the topMenu class does not exist, add it.
            if(el.children[0].className !== 'topMenu') {
                el.prepend(div);
            }
            var el2=$element[0].parentNode.children[1].children;
            if(el2) {
                // remove menu
                el2[2].remove();
                el2[2].remove();
            }

        };

    }]);


angular.module('viewCustom')
    .component('prmTopbarAfter',{
        bindings:{parentCtrl:'<'},
        controller: 'prmTopbarAfterCtrl',
        controllerAs:'vm',
        templateUrl:'/primo-explore/custom/HVD2/html/prm-topbar-after.html'
    });
