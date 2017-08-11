(function(){
"use strict";
'use strict';

/**
 * Created by samsan on 7/18/17.
 */

angular.module('viewCustom', ['angularLoad']);

/**
 * Created by samsan on 8/7/17.
 */

angular.module('viewCustom').service('customImagesService', ['$filter', function ($filter) {
    var serviceObj = {};

    // validate url start with $$U and contain $$D, then return new item list
    serviceObj.extractImageUrl = function (item, recordLinks) {
        var itemList = [];
        if (item.pnx.links) {
            var lln02 = item.pnx.links.lln02;
            var k = 0;
            if (lln02) {
                for (var i = 0; i < lln02.length; i++) {
                    var patternUrl = /^(\$\$U)/;
                    var patternWord = /(\$\$D)/;
                    var url = lln02[i];
                    if (patternUrl.test(url) && patternWord.test(url)) {
                        var newStr = url.split(' ');
                        newStr = newStr[0];
                        var newUrl = newStr.substring(3, newStr.length);

                        for (var j = 0; j < recordLinks.length; j++) {
                            var record = recordLinks[j];
                            var linkURL = record.linkURL;
                            if (linkURL) {
                                linkURL = linkURL.trim(' ');
                                newUrl = newUrl.trim(' ');
                                if (newUrl === linkURL) {
                                    // replace old url with word EBKPLL with EBKPLT
                                    linkURL = linkURL.replace(/(EBKPLL)/, 'EBKPLT');
                                    record.linkNewURL = linkURL + '?width=155&height=205';
                                    itemList[k] = record;
                                    k++;
                                    j = recordLinks.length;
                                }
                            }
                        }
                    }
                }
            }
        }

        return itemList;
    };

    // remove json object from json array
    serviceObj.removeMatchItems = function (arrayList, targetList) {
        var itemsList = [];
        if (arrayList.length > 0 && targetList.length > 0) {
            for (var i = 0; i < arrayList.length; i++) {
                var arr = arrayList[i];
                var flag = true;
                // find item that match
                for (var k = 0; k < targetList.length; k++) {
                    var target = targetList[k];
                    if (arr['@id'] === target['@id']) {
                        flag = false;
                        k = targetList.length;
                    }
                }
                // push item into list if it is not match
                if (flag) {
                    itemsList.push(arr);
                }
            }
        }
        return itemsList;
    };

    return serviceObj;
}]);

/**
 * Created by samsan on 7/18/17.
 * This is a service component and use to store data, get data, ajax call, compare any logic.
 */

angular.module('viewCustom').service('customService', ['$http', function ($http) {
    var serviceObj = {};

    serviceObj.getAjax = function (url, param, methodType) {
        return $http({
            'method': methodType,
            'url': url,
            'params': param
        });
    };

    serviceObj.postAjax = function (url, jsonObj) {
        return $http({
            'method': 'post',
            'url': url,
            'data': jsonObj
        });
    };

    // setter and getter
    serviceObj.items = {};
    serviceObj.setItems = function (data) {
        serviceObj.items = data;
    };
    serviceObj.getItems = function () {
        return serviceObj.items;
    };

    // replace & . It cause error in firefox;
    serviceObj.removeInvalidString = function (str) {
        var pattern = /[\&]/g;
        return str.replace(pattern, '&amp;');
    };

    //parse xml
    serviceObj.convertXML = function (str) {
        var listItems = [];
        str = serviceObj.removeInvalidString(str);
        var xmldata = xmlToJSON.parseString(str);
        if (xmldata.requestlinkconfig) {
            listItems = xmldata.requestlinkconfig[0].mainlocationcode;
        }

        return listItems;
    };

    // setter and getter for library list data logic from xml file
    serviceObj.logicList = [];
    serviceObj.setLogicList = function (arr) {
        serviceObj.logicList = arr;
    };

    serviceObj.getLogicList = function () {
        return serviceObj.logicList;
    };

    // compare logic
    serviceObj.getLocation = function (currLoc) {
        var item = '';
        for (var i = 0; i < serviceObj.logicList.length; i++) {
            var data = serviceObj.logicList[i];
            if (data._attr.id._value === currLoc.location.mainLocation) {
                item = data;
                i = serviceObj.logicList.length;
            }
        }

        return item;
    };

    // setter and getter for parent locations data
    serviceObj.parentData = {};
    serviceObj.setParentData = function (data) {
        serviceObj.parentData = data;
    };
    serviceObj.getParentData = function () {
        return serviceObj.parentData;
    };

    // locationInfoArray when the current Location is matched with xml location
    // itemsCategory is an ajax response with itemcategorycode when pass current location
    serviceObj.getRequestLinks = function (locationInfoArray, itemsCategory, ItemType, TextDisplay, index, flagBoolean) {
        var requestItem = { 'flag': false, 'item': {}, 'type': '', 'text': '', 'displayflag': false };
        requestItem.type = ItemType; // requestItem, scanDeliver, aeonrequest
        requestItem.text = TextDisplay; // Request Item, Scan & Delivery, Schedule visit
        requestItem.displayflag = flagBoolean;

        if (itemsCategory.length > 0 && locationInfoArray.length > 0) {

            for (var i = 0; i < locationInfoArray.length; i++) {
                var json = locationInfoArray[i];

                for (var j = 0; j < itemsCategory.length; j++) {
                    var itemCat = itemsCategory[j].items;

                    if (itemCat.length > 0) {
                        var item = itemCat[index];
                        var itemCategoryCodeList = '';
                        if (json._attr.itemcategorycode) {
                            itemCategoryCodeList = json._attr.itemcategorycode._value;
                            if (itemCategoryCodeList.length > 1) {
                                itemCategoryCodeList = itemCategoryCodeList.toString();
                                itemCategoryCodeList = itemCategoryCodeList.split(';'); // convert comma into array
                            } else {
                                if (parseInt(itemCategoryCodeList)) {
                                    // add 0 infront of a number
                                    var arr = [];
                                    itemCategoryCodeList = '0' + itemCategoryCodeList.toString();
                                    arr.push(itemCategoryCodeList);
                                    itemCategoryCodeList = arr;
                                } else {
                                    itemCategoryCodeList = itemCategoryCodeList.toString();
                                    itemCategoryCodeList = itemCategoryCodeList.split(';');
                                }
                            }
                        }
                        var itemStatusNameList = '';
                        if (json._attr.itemstatusname) {
                            itemStatusNameList = json._attr.itemstatusname._value;
                            itemStatusNameList = itemStatusNameList.split(';'); // convert comma into array
                        }
                        var processingStatusList = '';
                        if (json._attr.processingstatus) {
                            processingStatusList = json._attr.processingstatus._value;
                            processingStatusList = processingStatusList.split(';'); // convert comma into array
                        }
                        var queueList = '';
                        if (json._attr.queue) {
                            queueList = json._attr.queue._value;
                            queueList = queueList.split(';'); // convert comma into array
                        }

                        if (itemCategoryCodeList.length > 0) {
                            // compare if item category code is number
                            if (itemCategoryCodeList.indexOf(item.itemcategorycode) !== -1) {
                                if (item.processingstatus === '') {
                                    item.processingstatus = 'NULL';
                                }
                                if (item.queue === '') {
                                    item.queue = 'NULL';
                                }
                                if (itemStatusNameList.indexOf(item.itemstatusname) !== -1 && processingStatusList.indexOf(item.processingstatus) !== -1) {
                                    if (queueList.indexOf(item.queue) !== -1) {
                                        requestItem.flag = true;
                                        requestItem.item = item;
                                        i = locationInfoArray.length;
                                    } else if (!queueList) {
                                        requestItem.flag = true;
                                        requestItem.item = item;
                                        i = locationInfoArray.length;
                                    }
                                } else if (itemStatusNameList.length > 0) {
                                    for (var k = 0; k < itemStatusNameList.length; k++) {
                                        var statusName = itemStatusNameList[k];
                                        statusName = statusName.replace(/\*/g, '');
                                        var itemstatusname = item.itemstatusname;
                                        if (itemstatusname.includes(statusName) && processingStatusList.indexOf(item.processingstatus) !== -1) {
                                            requestItem.flag = true;
                                            requestItem.item = item;
                                            i = locationInfoArray.length;
                                        }
                                    }
                                }
                            } else if (itemCategoryCodeList[0] === '*') {
                                // compare if item category code is asterisk
                                if (itemStatusNameList.indexOf(item.itemstatusname) !== -1 && processingStatusList.indexOf(item.processingstatus) !== -1) {
                                    requestItem.flag = true;
                                    requestItem.item = item;
                                    i = locationInfoArray.length;
                                } else if (itemStatusNameList.length > 0) {
                                    // remove asterisk and find word in the array list
                                    for (var k = 0; k < itemStatusNameList.length; k++) {
                                        var statusName = itemStatusNameList[k];
                                        statusName = statusName.replace(/\*/g, '');
                                        var itemstatusname = item.itemstatusname;
                                        if (itemstatusname.includes(statusName) && processingStatusList.indexOf(item.processingstatus) !== -1) {
                                            requestItem.flag = true;
                                            requestItem.item = item;
                                            i = locationInfoArray.length;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return requestItem;
    };

    serviceObj.auth = {};
    serviceObj.setAuth = function (data) {
        serviceObj.auth = data;
    };

    serviceObj.getAuth = function () {
        return serviceObj.auth;
    };

    return serviceObj;
}]);

/**
 * Created by samsan on 8/7/17.
 */

angular.module('viewCustom').controller('prmAuthenticationAfterController', ['customService', function (customService) {
    var vm = this;
    // initialize custom service search
    var sv = customService;
    // check if a user login
    vm.$onChanges = function () {
        sv.setAuth(vm.parentCtrl);
    };
}]);

angular.module('viewCustom').component('prmAuthenticationAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmAuthenticationAfterController'
});

/**
 * Created by samsan on 8/10/17.
 * This component add a "Finding Aid" button and make a link
 */

angular.module('viewCustom').controller('prmBriefResultContainerAfterCtrl', ['$location', '$element', function ($location, $element) {
    var vm = this;
    var param = $location.search();
    vm.cssClass = 'marginLeftFindingAid';
    vm.findingAid = { 'displayLabel': '', 'linkURL': '', 'newLinkURL': '' };
    vm.$onChanges = function () {
        // find $$Elinktofa
        if (vm.parentCtrl.links) {
            for (var i = 0; i < vm.parentCtrl.links.length; i++) {
                var linkItem = vm.parentCtrl.links[i];
                var seqment = '';
                if (linkItem.displayLabel === '$$Elinktofa') {
                    vm.findingAid = linkItem;
                    if (linkItem.linkURL) {
                        var linkStr = linkItem.linkURL;
                        linkStr = linkStr.split(':');
                        if (linkStr.length > 0) {
                            seqment = linkStr[linkStr.length - 1];
                            seqment = seqment.trim(' ');
                        }
                    }
                    vm.findingAid.newLinkURL = 'http://id.lib.harvard.edu/ead/' + seqment + '/catalog';
                    i = vm.parentCtrl.links.length;
                }
            }
        }
        // add more padding when it is full display page
        if (param.docid) {
            vm.cssClass = 'marginLeftFindingAid2';
        }

        console.log('*** prm-brief-result-container-after ***');
        console.log(vm);
    };
}]);

angular.module('viewCustom').component('prmBriefResultContainerAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmBriefResultContainerAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-brief-result-container-after.html'
});

/**
 * Created by samsan on 7/18/17.
 * This component is using to build Request Item, Scan & Delivery, and Schedule visit link.
 * It pass the current location data to get a full list of current location with itemcategorycode.
 * Then compare it with xml logic data file
 */
angular.module('viewCustom').controller('prmLocationItemAfterCtrl', ['customService', '$window', '$scope', '$element', function (customService, $window, $scope, $element) {
    var vm = this;
    vm.currLoc = {};
    vm.locationInfo = {};
    vm.parentData = {};
    vm.itemsCategory = [{ 'itemcategorycode': '02', 'itemstatusname': 'Not checked out', 'processingstatus': '', 'queue': '' }]; // json data object from getItemCategoryCodes ajax call
    vm.logicList = []; // store logic list from the xml file
    vm.requestLinks = [];
    vm.auth = {};
    var sv = customService;

    // get item category code
    vm.getItemCategoryCodes = function () {
        if (vm.parentData.opacService && vm.currLoc.location) {
            var url = vm.parentData.opacService.restBaseURLs.ILSServicesBaseURL + '/holdings';
            var jsonObj = {
                'filters': {
                    'callnumber': '',
                    'collection': '',
                    'holid': '',
                    ilsRecordList: [{ 'institution': 'HVD', 'recordId': '' }],
                    'noItem': 6,
                    'startPos': 1,
                    'sublibrary': 'WID',
                    'sublibs': 'WID',
                    'vid': 'HVD2'
                },
                'locations': []
            };
            jsonObj.filters.holid = vm.currLoc.location.holdId;
            jsonObj.filters.vid = vm.parentData.locationsService.vid;
            jsonObj.filters.noItem = vm.parentData.locationsService.noItems;
            jsonObj.filters.sublibrary = vm.currLoc.location.mainLocation;
            jsonObj.filters.sublibs = vm.currLoc.location.mainLocation;
            jsonObj.filters.ilsRecordList[0].institution = vm.currLoc.location.organization;
            jsonObj.filters.ilsRecordList[0].recordId = vm.currLoc.location.ilsApiId;
            jsonObj.locations.push(vm.currLoc.location);
            sv.postAjax(url, jsonObj).then(function (result) {
                if (result.data.locations) {
                    vm.itemsCategory = result.data.locations;
                    vm.requestLinks = vm.compare(vm.itemsCategory);
                }
            }, function (err) {
                console.log(err);
            });
        }
    };

    // make comparison to see it is true so it can display the link
    vm.compare = function (itemsCategory) {
        // get the index of the element
        var index = 0;
        var el = $element[0].previousSibling.parentNode;
        var md_list = $element[0].parentNode.parentNode.children;
        for (var i = 0; i < md_list.length; i++) {
            if (md_list[i].$$hashKey === el.$$hashKey) {
                index = i;
                i = md_list.length;
            }
        }

        var requestLinks = [];
        // get requestItem
        if (vm.locationInfo.requestItem) {
            var flag = true;
            var auth = sv.getAuth();
            if (auth.isLoggedIn) {
                flag = false;
            }
            var dataList = sv.getRequestLinks(vm.locationInfo.requestItem[0].json, itemsCategory, 'requestItem', 'Request Item', index, flag);
            requestLinks.push(dataList);
        }
        // get scan & deliver link
        if (vm.locationInfo.scanDeliver) {
            var dataList = sv.getRequestLinks(vm.locationInfo.scanDeliver[0].json, itemsCategory, 'scanDeliver', 'Scan & Deliver', index, true);
            requestLinks.push(dataList);
        }
        // get schedule visit link
        if (vm.locationInfo.aeonrequest) {
            var dataList = sv.getRequestLinks(vm.locationInfo.aeonrequest[0].json, itemsCategory, 'aeonrequest', 'Schedule visit', index, true);
            requestLinks.push(dataList);
        }

        return requestLinks;
    };

    vm.$onInit = function () {
        // watch for variable change, then call an ajax to get current location of itemcategorycode
        // it won't work on angular 2
        $scope.$watch('vm.currLoc', function () {
            vm.locationInfo = sv.getLocation(vm.currLoc);
            vm.parentData = sv.getParentData();
            vm.getItemCategoryCodes();
        });
    };

    vm.$doCheck = function () {
        vm.data = sv.getItems();
        vm.currLoc = vm.data.currLoc;
    };

    vm.$onChanges = function (ev) {
        // list of logic xml data list that convert into json array
        vm.logicList = sv.getLogicList();
        vm.auth = sv.getAuth();
    };

    vm.signIn = function () {
        var auth = sv.getAuth();
        var url = '/primo-explore/login?from-new-ui=1&authenticationProfile=' + auth.authenticationMethods[0].profileName + '&search_scope=default_scope&tab=default_tab';
        url += '&Institute=' + auth.authenticationService.userSessionManagerService.userInstitution + '&vid=' + auth.authenticationService.userSessionManagerService.vid;
        url += '&targetURL=' + encodeURIComponent($window.location.href);
        $window.location.href = url;
    };

    // link to other web sites
    vm.goto = function (data) {
        var url = '';
        var itemrecordid = '';
        var itemSequence = '';
        // split itemrecordit to get docNumber and ItemSequence to build url
        if (data.item.itemrecordid) {
            var itemid = data.item.itemrecordid;
            if (itemid.length > 14) {
                itemrecordid = itemid.substring(5, 14);
                itemSequence = itemid.substring(itemid.length - 6, itemid.length);
            }
        }

        if (data.type === 'scanDeliver') {
            url = 'http://sfx.hul.harvard.edu/hvd?sid=HOLLIS:ILL&pid=DocNumber=' + itemrecordid + ',ItemSequence=' + itemSequence + '&sfx.skip_augmentation=1';
            $window.open(url, '_blank');
        } else if (data.type === 'aeonrequest') {
            url = 'http://sfx.hul.harvard.edu/hvd?sid=HOLLIS:AEON&pid=DocNumber=' + itemrecordid + ',ItemSequence=' + itemSequence + '&sfx.skip_augmentation=1';
            $window.open(url, '_blank');
        } else if (data.type === 'requestItem' && vm.auth.isLoggedIn === false) {
            // redirect to login for requestItem if a user is not login
            vm.signIn();
        }
    };

    // add keypress on a link
    vm.keypressGoto = function (e, data) {
        if (e.which === 13) {
            vm.goto(data);
        }
    };
}]);

angular.module('viewCustom').component('prmLocationItemAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmLocationItemAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-location-item-after.html'
});
/**
 * Created by samsan on 7/18/17.
 * This component read xml data from a file and store them into a service to use it prm-location-item-after component.
 * When a user click on each item, it capture the each location and pass into a service component
 */
angular.module('viewCustom').controller('prmLocationItemsAfterCtrl', ['customService', function (customService) {
    var vm = this;
    var sv = customService;
    vm.logicList = [];
    // get static xml data and convert to json
    vm.getLibData = function () {
        sv.getAjax('/primo-explore/custom/HVD2/html/requestLinkLogic.html', {}, 'get').then(function (respone) {
            if (respone.status === 200) {
                vm.logicList = sv.convertXML(respone.data);
                sv.setLogicList(vm.logicList);
            }
        }, function (err) {
            console.log(err);
        });
    };

    vm.$onInit = function () {
        vm.getLibData();
    };

    vm.$onChanges = function (ev) {
        // capture data and use it in prm-location-item-after component
        sv.setItems(vm.parentCtrl);
    };
}]);

angular.module('viewCustom').component('prmLocationItemsAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmLocationItemsAfterCtrl'
});
/**
 * Created by samsan on 7/18/17.
 * This component is to capture parent-ctrl data so it can access Rest base url endpoint to use it an ajax call
 *
 */

angular.module('viewCustom').controller('prmLocationsAfterCtrl', ['customService', function (customService) {
    var vm = this;
    var sv = customService;

    vm.$onChanges = function () {
        // capture restBaseUrl to use it in prm-location-item-after component
        sv.setParentData(vm.parentCtrl);
    };
}]);

angular.module('viewCustom').component('prmLocationsAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmLocationsAfterCtrl',
    controllerAs: 'vm'
});

/**
 * Created by samsan on 8/9/17.
 * It remove old logo and replace it with new logo
 */

angular.module('viewCustom').controller('prmLogoAfterCtrl', ['$element', function ($element) {
    var vm = this;
    vm.$onChanges = function () {
        // remove image logo
        var el = $element[0].parentNode.children[0];
        el.remove();
    };
}]);

angular.module('viewCustom').component('prmLogoAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmLogoAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-logo-after.html'
});

/**
 * Created by samsan on 8/7/17.
 */

angular.module('viewCustom').controller('prmServiceLinksAfterCtrl', ['customService', 'customImagesService', '$timeout', function (customService, customImagesService, $timeout) {
    var vm = this;
    var sv = customService;
    var cisv = customImagesService;
    vm.itemList = [];
    vm.recordLinks = []; // keep track the original vm.parentCtrl.recordLinks

    vm.getData = function () {
        // make a copy to avoid data binding
        vm.recordLinks = angular.copy(vm.parentCtrl.recordLinks);
        // get items that have digital bookplates
        vm.itemList = cisv.extractImageUrl(vm.parentCtrl.item, vm.recordLinks);
        // delay data from parentCtrl
        $timeout(function () {
            vm.recordLinks = angular.copy(vm.parentCtrl.recordLinks);
            vm.itemList = cisv.extractImageUrl(vm.parentCtrl.item, vm.recordLinks);
            if (vm.recordLinks.length > 0 && vm.itemList.length > 0) {
                vm.parentCtrl.recordLinks = cisv.removeMatchItems(vm.recordLinks, vm.itemList);
            }
        }, 1500);
    };

    vm.$onChanges = function () {
        vm.getData();
    };
}]);

angular.module('viewCustom').component('prmServiceLinksAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmServiceLinksAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-service-links-after.html'
});

/**
 * Created by samsan on 8/9/17.
 *  This component is creating white top bar, link menu on the right, and remove some doms
 */

angular.module('viewCustom').controller('prmTopbarAfterCtrl', ['$element', '$timeout', function ($element, $timeout) {
    var vm = this;

    vm.topRightMenus = [{ 'title': 'Research Guides', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:portal_resguides', 'label': 'Go to Research guides' }, { 'title': 'Libraries / Hours', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:bannerfindlib', 'label': 'Go to Library hours' }, { 'title': 'All My Accounts', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:banneraccounts', 'label': 'Go to all my accounts' }];

    vm.$onInit = function () {
        // hide primo tab menu
        vm.parentCtrl.showMainMenu = false;
        // create new div for the top white menu
        var el = $element[0].parentNode.parentNode.parentNode.parentNode.parentNode;
        var div = document.createElement('div');
        div.setAttribute('id', 'customTopMenu');
        div.setAttribute('class', 'topMenu');
        // if the topMenu class does not exist, add it.
        if (el.children[0].className !== 'topMenu') {
            el.prepend(div);
        }
        var el2 = $element[0].parentNode.children[1].children;
        if (el2) {
            // remove menu
            el2[2].remove();
            el2[2].remove();
        }
    };
}]);

angular.module('viewCustom').component('prmTopbarAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmTopbarAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-topbar-after.html'
});

/* Copyright 2015 William Summers, MetaTribal LLC
 * adapted from https://developer.mozilla.org/en-US/docs/JXON
 *
 * Licensed under the MIT License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @author William Summers
 *
 */

var xmlToJSON = function () {

    this.version = "1.3";

    var options = { // set up the default options
        mergeCDATA: true, // extract cdata and merge with text
        grokAttr: true, // convert truthy attributes to boolean, etc
        grokText: true, // convert truthy text/attr to boolean, etc
        normalize: true, // collapse multiple spaces to single space
        xmlns: true, // include namespaces as attribute in output
        namespaceKey: '_ns', // tag name for namespace objects
        textKey: '_text', // tag name for text nodes
        valueKey: '_value', // tag name for attribute values
        attrKey: '_attr', // tag for attr groups
        cdataKey: '_cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
        attrsAsObject: true, // if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
        stripAttrPrefix: true, // remove namespace prefixes from attributes
        stripElemPrefix: true, // for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
        childrenAsArray: true // force children into arrays
    };

    var prefixMatch = new RegExp(/(?!xmlns)^.*:/);
    var trimMatch = new RegExp(/^\s+|\s+$/g);

    this.grokType = function (sValue) {
        if (/^\s*$/.test(sValue)) {
            return null;
        }
        if (/^(?:true|false)$/i.test(sValue)) {
            return sValue.toLowerCase() === "true";
        }
        if (isFinite(sValue)) {
            return parseFloat(sValue);
        }
        return sValue;
    };

    this.parseString = function (xmlString, opt) {
        return this.parseXML(this.stringToXML(xmlString), opt);
    };

    this.parseXML = function (oXMLParent, opt) {

        // initialize options
        for (var key in opt) {
            options[key] = opt[key];
        }

        var vResult = {},
            nLength = 0,
            sCollectedTxt = "";

        // parse namespace information
        if (options.xmlns && oXMLParent.namespaceURI) {
            vResult[options.namespaceKey] = oXMLParent.namespaceURI;
        }

        // parse attributes
        // using attributes property instead of hasAttributes method to support older browsers
        if (oXMLParent.attributes && oXMLParent.attributes.length > 0) {
            var vAttribs = {};

            for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
                var oAttrib = oXMLParent.attributes.item(nLength);
                vContent = {};
                var attribName = '';

                if (options.stripAttrPrefix) {
                    attribName = oAttrib.name.replace(prefixMatch, '');
                } else {
                    attribName = oAttrib.name;
                }

                if (options.grokAttr) {
                    vContent[options.valueKey] = this.grokType(oAttrib.value.replace(trimMatch, ''));
                } else {
                    vContent[options.valueKey] = oAttrib.value.replace(trimMatch, '');
                }

                if (options.xmlns && oAttrib.namespaceURI) {
                    vContent[options.namespaceKey] = oAttrib.namespaceURI;
                }

                if (options.attrsAsObject) {
                    // attributes with same local name must enable prefixes
                    vAttribs[attribName] = vContent;
                } else {
                    vResult[options.attrKey + attribName] = vContent;
                }
            }

            if (options.attrsAsObject) {
                vResult[options.attrKey] = vAttribs;
            } else {}
        }

        // iterate over the children
        if (oXMLParent.hasChildNodes()) {
            for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
                oNode = oXMLParent.childNodes.item(nItem);

                if (oNode.nodeType === 4) {
                    if (options.mergeCDATA) {
                        sCollectedTxt += oNode.nodeValue;
                    } else {
                        if (vResult.hasOwnProperty(options.cdataKey)) {
                            if (vResult[options.cdataKey].constructor !== Array) {
                                vResult[options.cdataKey] = [vResult[options.cdataKey]];
                            }
                            vResult[options.cdataKey].push(oNode.nodeValue);
                        } else {
                            if (options.childrenAsArray) {
                                vResult[options.cdataKey] = [];
                                vResult[options.cdataKey].push(oNode.nodeValue);
                            } else {
                                vResult[options.cdataKey] = oNode.nodeValue;
                            }
                        }
                    }
                } /* nodeType is "CDATASection" (4) */
                else if (oNode.nodeType === 3) {
                        sCollectedTxt += oNode.nodeValue;
                    } /* nodeType is "Text" (3) */
                    else if (oNode.nodeType === 1) {
                            /* nodeType is "Element" (1) */

                            if (nLength === 0) {
                                vResult = {};
                            }

                            // using nodeName to support browser (IE) implementation with no 'localName' property
                            if (options.stripElemPrefix) {
                                sProp = oNode.nodeName.replace(prefixMatch, '');
                            } else {
                                sProp = oNode.nodeName;
                            }

                            vContent = xmlToJSON.parseXML(oNode);

                            if (vResult.hasOwnProperty(sProp)) {
                                if (vResult[sProp].constructor !== Array) {
                                    vResult[sProp] = [vResult[sProp]];
                                }
                                vResult[sProp].push(vContent);
                            } else {
                                if (options.childrenAsArray) {
                                    vResult[sProp] = [];
                                    vResult[sProp].push(vContent);
                                } else {
                                    vResult[sProp] = vContent;
                                }
                                nLength++;
                            }
                        }
            }
        } else if (!sCollectedTxt) {
            // no children and no text, return null
            if (options.childrenAsArray) {
                vResult[options.textKey] = [];
                vResult[options.textKey].push(null);
            } else {
                vResult[options.textKey] = null;
            }
        }

        if (sCollectedTxt) {
            if (options.grokText) {
                var value = this.grokType(sCollectedTxt.replace(trimMatch, ''));
                if (value !== null && value !== undefined) {
                    vResult[options.textKey] = value;
                }
            } else if (options.normalize) {
                vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '').replace(/\s+/g, " ");
            } else {
                vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '');
            }
        }

        return vResult;
    };

    // Convert xmlDocument to a string
    // Returns null on failure
    this.xmlToString = function (xmlDoc) {
        try {
            var xmlString = xmlDoc.xml ? xmlDoc.xml : new XMLSerializer().serializeToString(xmlDoc);
            return xmlString;
        } catch (err) {
            return null;
        }
    };

    // Convert a string to XML Node Structure
    // Returns null on failure
    this.stringToXML = function (xmlString) {
        try {
            var xmlDoc = null;

            if (window.DOMParser) {

                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(xmlString, "text/xml");

                return xmlDoc;
            } else {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString);

                return xmlDoc;
            }
        } catch (e) {
            return null;
        }
    };

    return this;
}.call({});

if (typeof module != "undefined" && module !== null && module.exports) module.exports = xmlToJSON;else if (typeof define === "function" && define.amd) define(function () {
    return xmlToJSON;
});
})();