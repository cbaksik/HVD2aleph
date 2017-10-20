(function(){
"use strict";
'use strict';

/**
 * Created by samsan on 7/18/17.
 */

angular.module('viewCustom', ['angularLoad']);

/**
 * Created by samsan on 9/22/17.
 */

angular.module('viewCustom').service('customGoogleAnalytic', ['$timeout', function ($timeout) {
    var svObj = {};
    // initialize google analytic
    svObj.init = function () {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments);
            }, i[r].l = 1 * new Date();a = s.createElement(o), m = s.getElementsByTagName(o)[0];a.async = 1;a.src = g;m.parentNode.insertBefore(a, m);
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ga('create', 'UA-52592218-13', 'auto', 'HVD2');
        ga('send', 'pageview');
    };

    // set up page
    svObj.setPage = function (urlPath, title) {
        $timeout(function () {

            var loc = window.location.href;
            ga('create', 'UA-52592218-13', 'auto', title);
            ga('send', { 'hitType': 'pageview', 'page': urlPath, 'title': title, location: loc });
        }, 500);
    };

    return svObj;
}]);

/**
 * Created by samsan on 9/20/17.
 */

angular.module('viewCustom').service('customHathiTrustService', ['$http', function ($http) {
    var serviceObj = {};

    serviceObj.doGet = function (url, param) {
        return $http({
            'method': 'get',
            'url': url,
            'timeout': 5000,
            'params': param
        });
    };

    serviceObj.doPost = function (url, param) {
        return $http({
            'method': 'post',
            'url': url,
            'timeout': 5000,
            'data': param
        });
    };

    serviceObj.validateHathiTrust = function (pnxItem) {
        var item = { 'flag': false, 'isbn': '', 'oclcid': '', 'data': {} };
        if (pnxItem.pnx.control.sourceid && pnxItem.pnx.delivery.delcategory && pnxItem.pnx.addata) {
            if (pnxItem.pnx.control.sourceid[0] === 'HVD_ALEPH' && pnxItem.pnx.delivery.delcategory[0] !== 'Online Resource') {
                item.flag = true;
                if (pnxItem.pnx.addata.oclcid) {
                    item.oclcid = pnxItem.pnx.addata.oclcid[0];
                } else if (pnxItem.pnx.addata.isbn) {
                    item.isbn = pnxItem.pnx.addata.isbn[0];
                }
            }
        }
        return item;
    };

    // validate if orig data is harvard
    serviceObj.validateHarvard = function (arrList) {
        var item = {};
        for (var i = 0; i < arrList.length; i++) {
            if (arrList[i].orig === 'Harvard University' && arrList[i].usRightsString === 'Full view') {
                item = arrList[i];
                item.huflag = true;
                item.fullview = true;
                i = arrList.length;
            } else if (arrList[i].usRightsString === 'Full view') {
                item = arrList[i];
                item.huflag = false;
                item.fullview = true;
                i = arrList.length;
            } else if (arrList[i].usRightsString === 'Limited (search-only)') {
                item = arrList[i];
                item.huflag = false;
                item.fullview = false;
                i = arrList.length;
            }
        }
        return item;
    };

    return serviceObj;
}]);

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
 * Created by samsan on 9/13/17.
 */

angular.module('viewCustom').service('customMapService', [function () {
    var serviceObj = {};
    serviceObj.getRegexMatches = function (string, regex, index) {
        index || (index = 1); // default to the first capturing group
        var matches = [];
        var match;
        while (match = regex.exec(string)) {
            matches.push(match[index]);
        }
        return matches;
    };

    serviceObj.buildCoordinatesArray = function (inputString) {
        var coordinates;
        //Populate array with Minutes format converstion
        if (RegExp(/\$\$D([a-zA-Z])/).test(inputString)) {
            coordinates = serviceObj.getRegexMatches(inputString, /\$\$[DEFG](.{8})/g);
            for (var i = 0; i < coordinates.length; i++) {
                var hemisphere = coordinates[i].substr(0, 1);
                var degrees = parseInt(coordinates[i].substr(1, 3));
                var minutes = parseInt(coordinates[i].substr(4, 2));
                var seconds = parseInt(coordinates[i].substr(6, 2));

                var decimalValue;
                if (hemisphere == "N" || hemisphere == "E") coordinates[i] = degrees + (minutes + seconds / 60) / 60;else coordinates[i] = 0 - (degrees + (minutes + seconds / 60) / 60);
            }
        }

        //Populate array with Degrees values
        else if (RegExp(/\$\$D(\d|-)/).test(inputString)) {
                coordinates = serviceObj.getRegexMatches(inputString, /\$\$\w([\d\.-]+)/g);
            }

        //Round the numbers to 6 decimal points
        if (coordinates) {
            for (var i = 0; i < coordinates.length; i++) {
                coordinates[i] = Math.round(coordinates[i] * 1000000) / 1000000;
            }
        }
        return coordinates;
    };

    return serviceObj;
}]);

/**
 * Created by samsan on 9/5/17.
 */

angular.module('viewCustom').controller('customPrintPageCtrl', ['$element', '$stateParams', 'customService', '$timeout', '$window', 'customGoogleAnalytic', function ($element, $stateParams, customService, $timeout, $window, customGoogleAnalytic) {
    var vm = this;
    var cga = customGoogleAnalytic;
    vm.item = {};
    var cs = customService;
    // get item data to display on full view page
    vm.getItem = function () {
        var url = vm.parentCtrl.searchService.cheetah.restBaseURLs.pnxBaseURL + '/' + vm.context + '/' + vm.docid;
        url += '?vid=' + vm.vid;
        cs.getAjax(url, '', 'get').then(function (result) {
            vm.item = result.data;
        }, function (error) {
            console.log(error);
        });
    };

    vm.$onInit = function () {
        // capture the parameter from UI-Router
        vm.docid = $stateParams.docid;
        vm.context = $stateParams.context;
        vm.vid = $stateParams.vid;
        vm.getItem();

        // initialize google analytic
        cga.init();

        $timeout(function () {
            // remove top menu and search bar
            var el = $element[0].parentNode.parentNode;

            if (el) {
                el.children[0].remove();
            }

            var topMenu = document.getElementById('customTopMenu');
            if (topMenu) {
                topMenu.remove();
            }

            // remove action list
            var actionList = document.getElementById('action_list');
            if (actionList) {
                actionList.remove();
            }

            // set google analytic page request statistic
            cga.setPage('/printPage', vm.docid);
        }, 1000);
    };

    vm.$postLink = function () {
        $timeout(function () {
            $window.print();
        }, 3000);
    };
}]);

angular.module('viewCustom').component('customPrintPage', {
    bindings: { parentCtrl: '<' },
    controller: 'customPrintPageCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/custom-print-page.html'
});

/**
 * Created by samsan on 9/5/17.
 */

angular.module('viewCustom').controller('customPrintCtrl', ['$window', '$stateParams', function ($window, $stateParams) {
    var vm = this;
    var params = $stateParams;

    vm.print = function () {
        var url = '/primo-explore/printPage/' + vm.parentCtrl.context + '/' + vm.parentCtrl.pnx.control.recordid;
        url += '?vid=' + params.vid;
        $window.open(url, '_blank');
    };
}]);

angular.module('viewCustom').config(function ($stateProvider) {
    $stateProvider.state('exploreMain.printPage', {
        url: '/printPage/:context/:docid',
        views: {
            '': {
                template: '<custom-print-page parent-ctrl="$ctrl"></custom-print-page>'
            }
        }
    });
}).component('customPrint', {
    bindings: { parentCtrl: '<' },
    controller: 'customPrintCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/custom-print.html'
});

/**
 * Created by samsan on 9/7/17.
 */

angular.module('viewCustom').controller('customScannedKeyContentCtrl', [function () {
    var vm = this;
    vm.lds41 = [];

    vm.$onChanges = function () {
        // re-construct json obj if lds41 is existed
        if (vm.item.pnx.display.lds41) {
            var lds41 = vm.item.pnx.display.lds41;
            for (var i = 0; i < lds41.length; i++) {
                var str = lds41[i];
                var arr = str.split('--');
                if (arr.length > 0) {
                    var obj = { 'title': '', 'url': '' };
                    obj.title = arr[0];
                    obj.url = arr[1];
                    vm.lds41.push(obj);
                }
            }
        }
    };
}]);

angular.module('viewCustom').component('customScannedKeyContent', {
    bindings: { item: '<' },
    controllerAs: 'vm',
    controller: 'customScannedKeyContentCtrl',
    templateUrl: '/primo-explore/custom/HVD2/html/custom-scanned-key-content.html'
});

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
            'timeout': 5000,
            'params': param
        });
    };

    serviceObj.postAjax = function (url, jsonObj) {
        // pass primo token to header with value call token
        $http.defaults.headers.common.token = jsonObj.token;
        return $http({
            'method': 'post',
            'url': url,
            'timeout': 5000,
            'data': jsonObj
        });
    };

    serviceObj.postData = function (url, jsonObj) {
        return $http({
            'method': 'post',
            'url': url,
            'timeout': 5000,
            'data': jsonObj
        });
    };

    // setter and getter for text msg data
    serviceObj.textData = {};
    serviceObj.setTextData = function (data) {
        serviceObj.textData = data;
    };

    serviceObj.getTextData = function () {
        return serviceObj.textData;
    };

    // action list selected
    serviceObj.actionName = 'none';
    serviceObj.setActionName = function (actionName) {
        serviceObj.actionName = actionName;
    };
    serviceObj.getActionName = function () {
        return serviceObj.actionName;
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

    // get url api from config.html file
    serviceObj.api = {};
    serviceObj.setApi = function (data) {
        serviceObj.api = data;
    };

    serviceObj.getApi = function () {
        return serviceObj.api;
    };

    return serviceObj;
}]);

/**
 * Created by samsan on 5/23/17.
 * If image has height that is greater than 150 px, then it will resize it. Otherwise, it just display what it is.
 */

angular.module('viewCustom').component('customThumbnail', {
    templateUrl: '/primo-explore/custom/HVD2/html/custom-thumbnail.html',
    bindings: {
        itemdata: '<',
        searchdata: '<'
    },
    controllerAs: 'vm',
    controller: ['$element', '$timeout', 'prmSearchService', function ($element, $timeout, prmSearchService) {
        var vm = this;
        var sv = prmSearchService;
        vm.localScope = { 'imgclass': '', 'hideLockIcon': false };
        vm.imageUrl = '/primo-explore/custom/HVD2/img/icon_image.png';
        vm.src = '';
        vm.imageCaption = '';
        vm.restricted = false;
        vm.imageFlag = false;

        // check if image is not empty and it has width and height and greater than 150, then add css class
        vm.$onChanges = function () {
            vm.localScope = { 'imgclass': '', 'hideLockIcon': false };
            if (vm.itemdata.image) {
                vm.imageFlag = true;
                if (vm.itemdata.image.length === 1) {
                    vm.src = vm.itemdata.image[0].thumbnail[0]._attr.href._value + '?width=150&height=150';
                    vm.restricted = vm.itemdata.image[0]._attr.restrictedImage._value;
                    if (vm.itemdata.image[0].caption) {
                        vm.imageCaption = vm.itemdata.image[0].caption[0]._text;
                    }
                }
            }

            if (vm.src && vm.imageFlag) {
                vm.imageUrl = sv.getHttps(vm.src);
                $timeout(function () {
                    var img = $element.find('img')[0];
                    // use default image if it is a broken link image
                    var pattern = /^(onLoad\?)/; // the broken image start with onLoad
                    if (pattern.test(vm.src)) {
                        img.src = '/primo-explore/custom/HVD2/img/icon_image.png';
                    }
                    img.onload = vm.callback;
                    if (img.clientWidth > 50) {
                        vm.callback();
                    }
                }, 300);
            }
        };
        vm.callback = function () {
            var image = $element.find('img')[0];
            if (image.height > 150) {
                vm.localScope.imgclass = 'responsivePhoto';
                image.className = 'md-card-image ' + vm.localScope.imgclass;
            }
            // show lock up icon
            if (vm.restricted) {
                vm.localScope.hideLockIcon = true;
            }
        };

        $element.bind('contextmenu', function (e) {
            e.preventDefault();
            return false;
        });
    }]
});

/**
 * Created by samsan on 7/17/17.
 */

angular.module('viewCustom').controller('customViewAllComponentMetadataController', ['$sce', '$element', '$location', 'prmSearchService', '$window', '$stateParams', '$timeout', 'customGoogleAnalytic', function ($sce, $element, $location, prmSearchService, $window, $stateParams, $timeout, customGoogleAnalytic) {

    var cga = customGoogleAnalytic;
    var vm = this;
    var sv = prmSearchService;
    vm.params = $location.search();
    // get ui-router parameters
    vm.context = $stateParams.context;
    vm.docid = $stateParams.docid;

    vm.xmldata = [];
    vm.items = {};
    // ajax call to get data
    vm.getData = function () {
        var restUrl = vm.parentCtrl.searchService.cheetah.restUrl + '/' + vm.context + '/' + vm.docid;
        var params = { 'vid': 'HVD_IMAGES', 'lang': 'en_US', 'search_scope': 'default_scope', 'adaptor': 'Local Search Engine' };
        params.vid = vm.params.vid;
        params.lang = vm.params.lang;
        params.search_scope = vm.params.search_scope;
        params.adaptor = vm.params.adaptor;
        sv.getAjax(restUrl, params, 'get').then(function (result) {
            vm.items = result.data;
            if (vm.items.pnx.addata) {
                vm.xmldata = sv.getXMLdata(vm.items.pnx.addata.mis1[0]);
            }
        }, function (err) {
            console.log(err);
        });
    };

    // show the pop up image
    vm.gotoFullPhoto = function (index) {
        // go to full display page
        var url = '/primo-explore/viewcomponent/' + vm.context + '/' + vm.docid + '/' + index + '?vid=' + vm.params.vid + '&lang=' + vm.params.lang;
        if (vm.params.adaptor) {
            url += '&adaptor=' + vm.params.adaptor;
        }
        $window.open(url, '_blank');
    };

    vm.$onChanges = function () {
        // hide search box
        var el = $element[0].parentNode.parentNode.children[0].children[2];
        if (el) {
            el.style.display = 'none';
        }

        // insert a header into black topbar
        $timeout(function (e) {
            var topbar = $element[0].parentNode.parentNode.children[0].children[0].children[1];
            if (topbar) {
                var divNode = document.createElement('div');
                divNode.setAttribute('class', 'metadataHeader');
                var textNode = document.createTextNode('FULL COMPONENT METADATA');
                divNode.appendChild(textNode);
                topbar.insertBefore(divNode, topbar.children[2]);
                // remove pin and bookmark
                topbar.children[3].remove();
                // remove user login message
                topbar.children[3].remove();
            }
            cga.setPage('/viewallcomponentmetadata', vm.docid);
        }, 500);

        vm.getData();
    };
}]);

angular.module('viewCustom').component('customViewAllComponentMetadata', {
    bindings: { parentCtrl: '<' },
    controller: 'customViewAllComponentMetadataController',
    controllerAs: 'vm',
    'templateUrl': '/primo-explore/custom/HVD2/html/custom-view-all-component-metadata.html'
});

/**
 * Created by samsan on 6/9/17.
 * This component is for a single image full display when a user click on thumbnail from a full display page
 */

angular.module('viewCustom').controller('customViewComponentController', ['$sce', '$mdMedia', 'prmSearchService', '$location', '$stateParams', '$element', '$timeout', 'customService', 'customGoogleAnalytic', function ($sce, $mdMedia, prmSearchService, $location, $stateParams, $element, $timeout, customService, customGoogleAnalytic) {

    var cga = customGoogleAnalytic;
    var vm = this;
    var sv = prmSearchService;
    var cisv = customService;
    // get location parameter
    vm.params = $location.search();
    // get parameter from angular ui-router
    vm.context = $stateParams.context;
    vm.docid = $stateParams.docid;
    vm.index = parseInt($stateParams.index);

    vm.photo = {};
    vm.flexsize = 80;
    vm.total = 0;
    vm.itemData = {};
    vm.imageNav = true;
    vm.xmldata = {};
    vm.imageTitle = '';
    vm.jp2 = false;

    // ajax call to get data
    vm.getData = function () {
        var url = vm.parentCtrl.searchService.cheetah.restBaseURLs.pnxBaseURL + '/' + vm.context + '/' + vm.docid;
        var params = { 'vid': '', 'lang': '', 'search_scope': '', 'adaptor': '' };
        params.vid = vm.params.vid;
        params.lang = vm.params.lang;
        params.search_scope = vm.params.search_scope;
        params.adaptor = vm.params.adaptor;
        sv.getAjax(url, params, 'get').then(function (result) {
            vm.item = result.data;
            // convert xml to json
            if (vm.item.pnx.addata) {
                vm.xmldata = sv.getXMLdata(vm.item.pnx.addata.mis1[0]);
            }

            // show total of image
            if (vm.xmldata.surrogate) {
                vm.total = vm.xmldata.surrogate.length;
            } else if (vm.xmldata.image) {
                vm.total = vm.xmldata.image.length;
            } else if (vm.xmldata.length) {
                vm.total = vm.xmldata.length;
            }
            // display photo
            vm.displayPhoto();
        }, function (error) {
            console.log(error);
        });
    };

    vm.displayPhoto = function () {
        vm.auth = cisv.getAuth();
        vm.isLoggedIn = vm.auth.isLoggedIn;
        if (vm.xmldata.surrogate && !vm.xmldata.image) {
            if (vm.xmldata.surrogate[vm.index].image) {
                vm.photo = vm.xmldata.surrogate[vm.index].image[0];
                // find out if the image is jp2 or not
                vm.jp2 = sv.findJP2(vm.photo);
            } else {
                vm.photo = vm.xmldata.surrogate[vm.index];
                vm.jp2 = sv.findJP2(vm.photo);
            }
            if (vm.xmldata.surrogate[vm.index].title) {
                vm.imageTitle = vm.xmldata.surrogate[vm.index].title[0].textElement[0]._text;
            }
        } else if (vm.xmldata.image) {
            vm.photo = vm.xmldata.image[vm.index];
            vm.jp2 = sv.findJP2(vm.photo);
        } else {
            vm.photo = vm.xmldata[vm.index];
        }

        if (vm.photo._attr && vm.photo._attr.restrictedImage) {
            if (vm.photo._attr.restrictedImage._value && vm.isLoggedIn === false) {
                vm.imageNav = false;
            }
        }
    };

    vm.$onChanges = function () {

        // if the smaller screen size, make the flex size to 100.
        if ($mdMedia('sm')) {
            vm.flexsize = 100;
        } else if ($mdMedia('xs')) {
            vm.flexsize = 100;
        }
        // call ajax and display data
        vm.getData();
        // hide search bar
        var el = $element[0].parentNode.parentNode.children[0].children[2];
        if (el) {
            el.style.display = 'none';
        }

        // insert a header into black topbar
        $timeout(function (e) {
            var topbar = $element[0].parentNode.parentNode.children[0].children[0].children[1];
            if (topbar) {
                var divNode = document.createElement('div');
                divNode.setAttribute('class', 'metadataHeader');
                var textNode = document.createTextNode('FULL IMAGE DETAIL');
                divNode.appendChild(textNode);
                topbar.insertBefore(divNode, topbar.children[2]);
                // remove pin and bookmark
                topbar.children[3].remove();
                // remove user login message
                topbar.children[3].remove();
            }

            cga.setPage('/viewcomponent', vm.docid);
        }, 500);
    };

    // next photo
    vm.nextPhoto = function () {
        vm.index++;
        if (vm.index < vm.total && vm.index >= 0) {
            vm.displayPhoto();
        } else {
            vm.index = 0;
            vm.displayPhoto();
        }
    };
    // prev photo
    vm.prevPhoto = function () {
        vm.index--;
        if (vm.index >= 0 && vm.index < vm.total) {
            vm.displayPhoto();
        } else {
            vm.index = vm.total - 1;
            vm.displayPhoto();
        }
    };

    // check if the item is array or not
    vm.isArray = function (obj) {
        if (Array.isArray(obj)) {
            return true;
        } else {
            return false;
        }
    };
}]);

angular.module('viewCustom').component('customViewComponent', {
    bindings: { item: '<', services: '<', params: '<', parentCtrl: '<' },
    controller: 'customViewComponentController',
    controllerAs: 'vm',
    'templateUrl': '/primo-explore/custom/HVD2/html/custom-view-component.html'
});

/**
 * Created by samsan on 5/23/17.
 * If image has height that is greater than 150 px, then it will resize it. Otherwise, it just display what it is.
 */

angular.module('viewCustom').component('multipleThumbnail', {
    templateUrl: '/primo-explore/custom/HVD2/html/multipleThumbnail.html',
    bindings: {
        itemdata: '<',
        searchdata: '<'
    },
    controllerAs: 'vm',
    controller: ['$element', '$timeout', 'prmSearchService', function ($element, $timeout, prmSearchService) {
        var vm = this;
        var sv = prmSearchService;
        vm.localScope = { 'imgclass': '', 'hideLockIcon': false, 'hideTooltip': false };
        vm.imageUrl = '/primo-explore/custom/HVD2/img/icon_image.png';
        vm.src = '';
        vm.imageTitle = '';
        vm.restricted = false;
        vm.imageFlag = false;

        // check if image is not empty and it has width and height and greater than 150, then add css class
        vm.$onChanges = function () {

            vm.localScope = { 'imgclass': '', 'hideLockIcon': false };
            if (vm.itemdata.image) {
                vm.imageFlag = true;
                if (vm.itemdata.image.length === 1) {
                    vm.src = vm.itemdata.image[0].thumbnail[0]._attr.href._value + '?width=150&height=150';
                    vm.restricted = vm.itemdata.image[0]._attr.restrictedImage._value;
                    if (vm.itemdata.image[0].caption) {
                        vm.imageTitle = vm.itemdata.image[0].caption[0]._text;
                    } else if (vm.itemdata.title) {
                        vm.imageTitle = vm.itemdata.title[0].textElement[0]._text;
                    }
                }
            } else if (vm.itemdata.title) {
                vm.imageTitle = vm.itemdata.title[0].textElement[0]._text;
            }

            if (vm.src && vm.imageFlag) {
                vm.imageUrl = sv.getHttps(vm.src);
                $timeout(function () {
                    var img = $element.find('img')[0];
                    // use default image if it is a broken link image
                    var pattern = /^(onLoad\?)/; // the broken image start with onLoad
                    if (pattern.test(vm.src)) {
                        img.src = '/primo-explore/custom/HVD_IMAGES/img/icon_image.png';
                    }
                    img.onload = vm.callback;
                    if (img.clientWidth > 50) {
                        vm.callback();
                    }
                }, 300);
            }
        };
        vm.callback = function () {
            var image = $element.find('img')[0];
            if (image.height > 150) {
                vm.localScope.imgclass = 'responsivePhoto';
                image.className = 'md-card-image ' + vm.localScope.imgclass;
            }
            // show lock up icon
            if (vm.restricted) {
                vm.localScope.hideLockIcon = true;
            }
        };

        $element.bind('contextmenu', function (e) {
            e.preventDefault();
            return false;
        });
    }]
});

// truncate word to limit 60 characters
angular.module('viewCustom').filter('truncatefilter', function () {
    return function (str) {
        var newstr = str;
        var index = 45;
        if (str) {
            if (str.length > 45) {
                newstr = str.substring(0, 45);
                for (var i = newstr.length; i > 20; i--) {
                    var text = newstr.substring(i - 1, i);
                    if (text === ' ') {
                        index = i;
                        i = 20;
                    }
                }
                newstr = str.substring(0, index) + '...';
            }
        }

        return newstr;
    };
});

/**
 * Created by samsan on 8/16/17.
 */

angular.module('viewCustom').controller('prmActionContainerAfterCtrl', ['customService', 'prmSearchService', '$window', 'customGoogleAnalytic', function (customService, prmSearchService, $window, customGoogleAnalytic) {

    var cisv = customService;
    var cs = prmSearchService;
    var cga = customGoogleAnalytic;
    var vm = this;
    vm.restsmsUrl = '';
    vm.locations = [];
    vm.temp = { 'phone': '' };
    vm.form = { 'phone': '', 'deviceType': '', 'body': '', 'error': '', 'mobile': false, 'msg': '', 'token': '', 'ip': '', 'sessionToken': '', 'isLoggedIn': false, 'iat': '', 'inst': '', 'vid': '', 'exp': '', 'userName': '', 'iss': '', 'onCampus': false };

    vm.$onChanges = function () {
        vm.auth = cisv.getAuth();
        if (vm.auth.primolyticsService.jwtUtilService) {
            vm.form.token = vm.auth.primolyticsService.jwtUtilService.storageUtil.sessionStorage.primoExploreJwt;
            vm.form.sessionToken = vm.auth.primolyticsService.jwtUtilService.storageUtil.localStorage.getJWTFromSessionStorage;
            vm.form.isLoggedIn = vm.auth.isLoggedIn;
            // decode JWT Token to see if it is a valid token
            var obj = vm.auth.authenticationService.userSessionManagerService.jwtUtilService.jwtHelper.decodeToken(vm.form.token);
            vm.form.ip = obj.ip;
            vm.form.iss = obj.iss;
            vm.form.userName = obj.userName;
            vm.form.iat = obj.iat;
            vm.form.exp = obj.exp;
            vm.form.vid = obj.viewId;
            vm.form.inst = obj.viewInstitutionCode;
            vm.form.onCampus = obj.onCampus;
        }
    };

    vm.keyChange = function (e) {
        if (e.which > 47 && e.which < 58) {
            vm.form.error = '';
            var phone = angular.copy(vm.temp.phone);
            phone = phone.replace(/[\(\)\-]/g, '');
            if (phone.length > 2 && phone.length < 5) {
                vm.temp.phone = '(' + phone.substring(0, 3) + ')' + phone.substring(3, phone.length);
            } else if (phone.length > 5 && phone.length < 14) {
                vm.temp.phone = '(' + phone.substring(0, 3) + ')' + phone.substring(3, 6) + '-' + phone.substring(6, phone.length);
            }
        } else if (e.which > 96 && e.which < 123) {
            vm.form.error = 'Enter invalid phone number';
        } else {
            vm.form.error = 'Enter invalid phone number';
        }
    };

    vm.$onInit = function () {
        // check if a user is using mobile phone or laptop browser
        vm.form.deviceType = cs.getPlatform();
        if (vm.form.deviceType) {
            vm.form.mobile = true;
        } else {
            vm.form.deviceType = cs.getBrowserType();
        }

        vm.locations = vm.parentCtrl.item.delivery.holding;
        for (var i = 0; i < vm.locations.length; i++) {
            vm.locations[i].cssClass = 'textsms-row';
        }
    };

    vm.$doCheck = function () {
        // get action name when a user click on each action list
        var actionName = cisv.getActionName();
        if (actionName && vm.parentCtrl.actionName !== 'none') {
            vm.parentCtrl.actionName = actionName;
        } else if (actionName === 'textsms') {
            vm.parentCtrl.actionName = actionName;
        }
    };

    // this function is trigger only if a user is using laptop computer
    vm.sendText = function (k) {
        // get rest endpoint from config.html file. It's preload in prm-topbar-after.js
        vm.api = cisv.getApi();
        if (vm.api) {
            vm.restsmsUrl = vm.api.smsUrl;
        }

        // reset the row css class
        for (var i = 0; i < vm.locations.length; i++) {
            vm.locations[i].cssClass = 'textsms-row';
        }
        // set select row highlite
        vm.locations[k].cssClass = 'textsms-row-visited';

        var phone = '';

        if (vm.temp.phone.length > 0) {
            phone = angular.copy(vm.temp.phone);
            phone = phone.replace(/[\(\)\-]/g, '');
        }

        vm.form.error = '';
        vm.form.msg = '';
        var count = 0;
        if (!phone) {
            vm.form.error = 'Enter your phone number';
            count++;
        } else if (isNaN(phone) || phone.length < 10) {
            vm.form.error = 'Enter a valid phone number';
            count++;
        }

        // get the library name and call number
        var el = document.getElementById('smsLocation');
        if (el) {
            vm.form.body = el.children[k].innerText;
        }
        if (count === 0) {
            vm.form.phone = phone;
            var title = '';
            if (vm.parentCtrl.item.pnx.display.title) {
                title = vm.parentCtrl.item.pnx.display.title[0];
                var pattern = /[:]/;
                if (pattern.test(title)) {
                    var arr = title.split(':');
                    title = arr[0];
                    if (title.length > 30) {
                        title = title.substring(0, 30);
                    }
                    title = title.trim();
                    title += '... ';
                } else if (title.length > 30) {
                    title = title.substring(0, 30);
                    title += '... ';
                } else {
                    title += '... ';
                }

                vm.form.body = title + vm.form.body;

                var sendTitle = vm.form.userName + ' : ' + vm.form.body;
                cga.setPage('/sendsms', sendTitle);
            }

            if (vm.form.mobile) {
                var url = 'sms:' + vm.form.phone + '&body=' + vm.form.body;
                $window.open(url, '_blank');
            } else {
                cisv.postAjax(vm.restsmsUrl, vm.form).then(function (result) {
                    if (result.status === 200) {
                        if (result.data.status) {
                            var data = JSON.parse(result.data.msg);
                            data = data.data.message[0];
                            if (data.accepted) {
                                vm.form.msg = 'The message has been sent to ' + vm.temp.phone + '.';
                            } else {
                                vm.form.msg = 'The message did not send. The ClickAtell did not accept sms.';
                            }
                        } else {
                            vm.form.msg = result.data.msg;
                        }
                    } else {
                        vm.form.msg = 'There is a technical issue with Text Message Server. Please try it later on.';
                    }
                }, function (error) {
                    console.log(error);
                    vm.form.msg = 'There is a technical issue with Text Message Server. The rest endpoint server may be down.';
                });
            }
        }
    };
}]);

angular.module('viewCustom').component('prmActionContainerAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmActionContainerAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-action-container-after.html'
});

/**
 * Created by samsan on 8/15/17.
 * This component will insert textsms and its icon into the action list
 */

angular.module('viewCustom').controller('prmActionListAfterCtrl', ['$element', '$compile', '$scope', '$timeout', 'customService', function ($element, $compile, $scope, $timeout, customService) {
    var vm = this;
    var cisv = customService;
    vm.$onInit = function () {
        // if holding location is existed, then insert Text call # into action list
        if (vm.parentCtrl.item.delivery.holding.length > 0) {
            // insert  textsms into existing action list
            vm.parentCtrl.actionLabelNamesMap.textsms = 'Text call #';
            vm.parentCtrl.actionListService.actionsToIndex.textsms = vm.parentCtrl.requiredActionsList.length + 1;
            if (vm.parentCtrl.actionListService.requiredActionsList.indexOf('textsms') === -1) {
                vm.parentCtrl.actionListService.requiredActionsList.push('textsms');
            }
        }
    };

    vm.$onChanges = function () {
        $timeout(function () {
            // if holding location is existed, then insert sms text call icon
            if (vm.parentCtrl.item.delivery.holding.length > 0) {
                var el = document.getElementById('textsms');
                if (el) {
                    //remove prm-icon
                    var prmIcon = el.children[0].children[0].children[0].children[0];
                    prmIcon.remove();
                    // insert new icon
                    var childNode = el.children[0].children[0].children[0];
                    var mdIcon = document.createElement('md-icon');
                    mdIcon.setAttribute('md-svg-src', '/primo-explore/custom/HVD2/img/ic_textsms_black_24px.svg');
                    childNode.prepend(mdIcon);
                    $compile(childNode)($scope); // refresh the dom
                }
            } else {
                var el = document.getElementById('textsms');
                if (el) {
                    el.remove();
                }
            }

            // print
            var printEl = document.getElementById('Print');
            if (printEl) {
                printEl.children[0].remove();
                var printTag = document.createElement('custom-print');
                printTag.setAttribute('parent-ctrl', 'vm.parentCtrl.item');
                printEl.appendChild(printTag);
                $compile(printEl.children[0])($scope);
            }
        }, 2000);
    };

    vm.$doCheck = function () {
        // pass active action to prm-action-container-after
        if (vm.parentCtrl.activeAction) {
            cisv.setActionName(vm.parentCtrl.activeAction);
        }
    };
}]);

angular.module('viewCustom').component('prmActionListAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmActionListAfterCtrl',
    controllerAs: 'vm'
});

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

angular.module('viewCustom').controller('prmBriefResultContainerAfterCtrl', ['$location', function ($location) {
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
    };
}]);

angular.module('viewCustom').component('prmBriefResultContainerAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmBriefResultContainerAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-brief-result-container-after.html'
});

/* Author: Sam san
   This component is to capture item data from the parentCtrl. Then pass it to prm-view-online-after component
 */
angular.module('viewCustom').controller('prmFullViewAfterCtrl', ['prmSearchService', '$timeout', 'customGoogleAnalytic', function (prmSearchService, $timeout, customGoogleAnalytic) {
    var vm = this;
    var sv = prmSearchService;
    var cga = customGoogleAnalytic;

    vm.hideBrowseShelf = function () {
        var hidebrowseshelfFlag = false;
        var item = vm.parentCtrl.item;
        if (item.pnx.control) {
            var sourceid = item.pnx.control.sourceid;
            // find if item is HVD_VIA
            if (sourceid.indexOf('HVD_VIA') !== -1) {
                hidebrowseshelfFlag = true;
            }
        }
        // hide browse shelf if the item is HVD_VIA is true
        if (hidebrowseshelfFlag) {
            var services = vm.parentCtrl.services;
            for (var i = 0; i < services.length; i++) {
                if (services[i].serviceName === 'virtualBrowse') {
                    services.splice(i, 1);
                    i = services.length;
                }
            }
        }
    };

    vm.$onChanges = function () {
        var itemData = { 'item': {}, 'searchData': {} };
        itemData.item = angular.copy(vm.parentCtrl.item);
        if (vm.parentCtrl.searchService) {
            itemData.searchData = vm.parentCtrl.searchService.$stateParams;
        }
        // pass this data to use for online section
        sv.setItem(itemData);
        // hide browse shelf it is an image HVD_VIA
        vm.hideBrowseShelf();
    };

    vm.$onInit = function () {
        // remove more section so the view online would show twice
        $timeout(function () {
            if (vm.parentCtrl.item.pnx.display.lds41) {
                for (var i = 0; i < vm.parentCtrl.services.length; i++) {
                    // remove More section
                    if (vm.parentCtrl.services[i].scrollId === 'getit_link2') {
                        vm.parentCtrl.services.splice(i, 1);
                    }
                    // remove any links under view online section
                    if (vm.parentCtrl.services[i].scrollId === 'getit_link1_0') {
                        vm.parentCtrl.services[i].linkElement = {};
                    }
                }
            }

            // remove tags section
            if (vm.parentCtrl.services) {
                for (var _i = 0; _i < vm.parentCtrl.services.length; _i++) {
                    // remove More section
                    if (vm.parentCtrl.services[_i].scrollId === 'tags') {
                        vm.parentCtrl.services.splice(_i, 1);
                    }
                }
            }

            // set up google analytic
            if (vm.parentCtrl.item.pnx.display) {
                var title = vm.parentCtrl.item.pnx.display.title[0] + ' : ' + vm.parentCtrl.item.pnx.control.recordid[0];
                cga.setPage('/fulldisplay', title);
            } else {
                cga.setPage('/fulldisplay', 'Full display page');
            }
        }, 500);
    };
}]);

angular.module('viewCustom').component('prmFullViewAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmFullViewAfterCtrl',
    controllerAs: 'vm'
});

/**
 * Created by samsan on 8/23/17.
 */

angular.module('viewCustom').controller('prmLocationAfterCtrl', ['$element', '$compile', '$scope', '$window', function ($element, $compile, $scope, $window) {
    var vm = this;
    vm.libraryName = '';

    //insert icon and copy the library name. Then format it.
    vm.createIcon = function () {
        // insert place icon and align it
        var el = $element[0].parentNode.children[0].children[0].children[0].children[0];
        if (el.children) {
            if (el.children[0].tagName === 'H3' && vm.libraryName) {
                el.children[0].remove();
                var h3 = document.createElement('h3');
                h3.innerText = vm.libraryName;
                var mdIcon = document.createElement('md-icon');
                mdIcon.setAttribute('md-svg-src', '/primo-explore/custom/HVD2/img/place.svg');
                mdIcon.setAttribute('class', 'placeIcon');
                mdIcon.setAttribute('ng-click', 'vm.goPlace(vm.parentCtrl.location,$event)');
                h3.appendChild(mdIcon);
                el.prepend(h3);
                $compile(el.children[0])($scope);
            }
        }
    };

    vm.$doCheck = function () {
        // insert place icon and align it
        var el = $element[0].parentNode.children[0].children[0].children[0].children[0];
        if (el.children) {
            if (el.children[0].tagName === 'H3' && !vm.libraryName) {
                var text = el.children[0].innerText;
                if (text) {
                    vm.libraryName = text;
                }
            }
        }
    };

    vm.$onInit = function () {
        $scope.$watch('vm.libraryName', function () {
            if (vm.libraryName) {
                vm.createIcon();
            }
        });
    };

    vm.goPlace = function (loc, e) {
        e.stopPropagation();
        var url = 'http://nrs.harvard.edu/urn-3:hul.ois:' + loc.mainLocation;
        $window.open(url, '_blank');
        return true;
    };
}]);

angular.module('viewCustom').component('prmLocationAfter', {
    bindings: { parentCtrl: '<' },
    controllerAs: 'vm',
    controller: 'prmLocationAfterCtrl'
});

/**
 * Created by samsan on 7/18/17.
 * This component is using to build Request Item, Scan & Delivery, and Schedule visit link.
 * It pass the current location data to get a full list of current location with itemcategorycode.
 * Then compare it with xml logic data file
 */
angular.module('viewCustom').controller('prmLocationItemAfterCtrl', ['customService', '$window', '$scope', '$element', '$compile', '$timeout', '$filter', function (customService, $window, $scope, $element, $compile, $timeout, $filter) {
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

    vm.createIcon = function () {
        // insert place icon and align it
        var el = $element[0].parentNode.parentNode.parentNode.children[1].children[0];
        vm.libName = $filter('translate')(vm.currLoc.location.libraryCode);
        if (el.children[0].tagName === 'H4' && vm.libName && el) {
            el.children[0].remove();
            var h4 = document.createElement('h4');
            h4.setAttribute('class', 'md-title');
            var span = document.createElement('span');
            span.innerText = vm.libName;
            h4.appendChild(span);
            var mdIcon = document.createElement('md-icon');
            mdIcon.setAttribute('md-svg-src', '/primo-explore/custom/HVD2/img/place.svg');
            mdIcon.setAttribute('class', 'placeIcon');
            mdIcon.setAttribute('ng-click', 'vm.goPlace(vm.currLoc.location,$event)');
            h4.appendChild(mdIcon);
            if (el.children.length > 0) {
                el.insertBefore(h4, el.children[0]);
                $compile(el.children[0])($scope);
            }
        }
    };

    vm.goPlace = function (loc, e) {
        e.stopPropagation();
        var url = 'http://nrs.harvard.edu/urn-3:hul.ois:' + loc.mainLocation;
        $window.open(url, '_blank');
        return true;
    };

    // make comparison to see it is true so it can display the link
    vm.compare = function (itemsCategory) {
        // get the index of the element
        var index = 0;
        var el = $element[0].previousSibling.parentNode;
        if ($element[0].parentNode.parentNode) {
            var md_list = $element[0].parentNode.parentNode.children;
            for (var i = 0; i < md_list.length; i++) {
                if (md_list[i] === el) {
                    index = i;
                    i = md_list.length;
                }
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
            var dataList = sv.getRequestLinks(vm.locationInfo.aeonrequest[0].json, itemsCategory, 'aeonrequest', 'Request Item', index, true);
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
            vm.createIcon();
        });
    };

    vm.$doCheck = function () {
        vm.data = sv.getItems();
        vm.currLoc = vm.data.currLoc;
        // remove bookingRequest and photocopy request
        if (vm.currLoc.items) {
            for (var k = 0; k < vm.currLoc.items.length; k++) {
                if (vm.currLoc.items[k].listOfServices) {
                    for (var i = 0; i < vm.currLoc.items[k].listOfServices.length; i++) {
                        if (vm.currLoc.items[k].listOfServices[i].type === 'BookingRequest' || vm.currLoc.items[k].listOfServices[i].type === 'PhotocopyRequest') {
                            vm.currLoc.items[k].listOfServices.splice(i, 1);
                        }
                    }
                }
            }
        }
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
angular.module('viewCustom').controller('prmLocationItemsAfterCtrl', ['customService', '$element', '$timeout', '$window', '$sce', function (customService, $element, $timeout, $window, $sce) {
    var vm = this;
    var sv = customService;
    vm.libName = '';
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

    // remove add note section native above white box
    vm.removeDom = function () {
        var el = $element[0].parentNode.children[1].children[0].children;
        if (el) {
            if (el.length > 2) {
                el[2].remove();
            }
        }
    };

    vm.goPlace = function (loc, e) {
        e.stopPropagation();
        var url = 'http://nrs.harvard.edu/urn-3:hul.ois:' + loc.mainLocation;
        $window.open(url, '_blank');
        return true;
    };

    vm.$onInit = function () {
        vm.getLibData();
    };

    vm.$doCheck = function () {
        // hide location that has no item text display
        if (vm.parentCtrl.loc) {
            if (vm.parentCtrl.loc.items.length === 0) {
                if ($element[0].parentNode) {
                    var el = $element[0].parentNode.children;
                    if (el) {
                        if (el.length > 2) {
                            el[2].style.display = 'none';
                        }
                    }
                }
            } else if ($element[0].parentNode.children) {
                var el = $element[0].parentNode.children;
                if (el) {
                    if (el.length > 2) {
                        el[2].style.display = 'block';
                    }
                }
            }
        }
        vm.removeDom();
        sv.setItems(vm.parentCtrl);
    };
}]);

angular.module('viewCustom').component('prmLocationItemsAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmLocationItemsAfterCtrl',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-location-items-after.html'
});

// create href link if there is url for online section
angular.module('viewCustom').filter('urlFilter', ['$filter', function ($filter) {
    return function (str, key) {
        var newStr = '';
        var translateKey = $filter('translate')(key);
        if (translateKey.toLowerCase() === 'online:') {
            var strList = str.split(';');
            var pattern = /^(http:\/\/)/;
            if (strList.length > 1) {
                var str1 = strList[0];
                var str2 = strList[1];
                if (pattern.test(str2)) {
                    newStr = str1 + '; <a href="' + str2 + '" target="_blank">' + str2 + '</a>';
                } else if (pattern.test(str1)) {
                    newStr = '<a href="' + str1 + '" target="_blank">' + str1 + '</a>' + '; ' + str2;
                } else {
                    newStr = str;
                }
            } else {
                if (pattern.test(str)) {
                    newStr = '<a href="' + str + '" target="_blank">' + str + '</a>';
                } else {
                    newStr = str;
                }
            }
        } else {
            newStr = str;
        }
        return newStr;
    };
}]);
/**
 * Created by samsan on 7/18/17.
 * This component is to capture parent-ctrl data so it can access Rest base url endpoint to use it an ajax call
 *
 */

angular.module('viewCustom').controller('prmLocationsAfterCtrl', ['customService', function (customService) {
    var vm = this;
    var sv = customService;

    vm.$doCheck = function () {
        // remove network resource display from location
        var results = vm.parentCtrl.getLocations();
        var temp = [];
        for (var i = 0; i < results.length; i++) {
            if (results[i].location.libraryCode !== 'HVD_NET') {
                temp.push(results[i]);
            }
        }
        if (temp.length > 0) {
            // reset location
            vm.parentCtrl.locations[0] = temp;
        }

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
        if (el) {
            el.remove();
        }

        // remove skip link
        var el2 = $element[0].parentNode.parentNode.children[0];
        if (el2) {
            el2.remove();
        }
    };
}]);

angular.module('viewCustom').component('prmLogoAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmLogoAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-logo-after.html'
});

/**
 * Created by samsan on 10/19/17.
 * Add BorrowDirect link on full display page under location items
 */

angular.module('viewCustom').controller('prmOpacAfterCtrl', [function () {
    var vm = this;
    vm.borrowInfo = { 'flag': false, 'journal': false, 'query': '' };

    // validate to see if pnx data meet criteria
    vm.validatePNX = function () {
        if (vm.parentCtrl.item.pnx) {
            var pnx = vm.parentCtrl.item.pnx.control.sourceid;
            for (var i = 0; i < pnx.length; i++) {
                if (pnx[i] === 'HVD_ALEPH') {
                    vm.borrowInfo.flag = true;
                    i = pnx.length;
                }
            }
            var pnxTypes = vm.parentCtrl.item.pnx.display.type;
            for (var _i2 = 0; _i2 < pnxTypes.length; _i2++) {
                if (pnxTypes[_i2] === 'journal') {
                    vm.borrowInfo.journal = true;
                    _i2 = pnxTypes.length;
                }
            }
            if (vm.parentCtrl.item.pnx.addata.isbn) {
                vm.borrowInfo.query = 'isbn=' + vm.parentCtrl.item.pnx.addata.isbn[0];
            } else if (vm.parentCtrl.item.pnx.display.title) {
                vm.borrowInfo.query = vm.parentCtrl.item.pnx.display.title[0];
            }
        }
    };

    vm.$onInit = function () {
        vm.validatePNX();
    };
}]);

angular.module('viewCustom').component('prmOpacAfter', {
    bindings: { parentCtrl: '<' },
    controllerAs: 'vm',
    controller: 'prmOpacAfterCtrl',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-opac-after.html'
});

/**
 * Created by samsan on 9/18/17.
 */

angular.module('viewCustom').controller('prmPermalinkAfterCtrl', ['$scope', '$sce', '$element', function ($scope, $sce, $element) {
    var vm = this;
    vm.msg = { 'class': '' };
    vm.$onInit = function () {
        vm.permalinkText = '';
        // change perm a link to correct url
        $scope.$watch('vm.parentCtrl.permalink', function () {
            if (vm.parentCtrl.item) {
                if (vm.parentCtrl.item.pnx.display.lds03[0]) {
                    vm.parentCtrl.permalink = vm.parentCtrl.item.pnx.display.lds03[0];
                }
            }
            if (vm.parentCtrl.permalink) {
                vm.permalink = $sce.trustAsHtml(vm.parentCtrl.permalink);
                // remove parent node
                var pNode = $element[0].parentNode.children[0];
                if (pNode) {
                    pNode.style.display = 'none';
                }
                // get link text
                var el = $element[0].children[0].children[0].children[0].children[0].children[0].children[0];
                if (el) {
                    vm.permalinkText = el.textContent;
                }
            }
        });
    };

    vm.selectText = function () {
        vm.msg.class = 'highlite';
    };
    vm.unSelectText = function () {
        vm.msg.class = '';
    };
}]);

angular.module('viewCustom').component('prmPermalinkAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmPermalinkAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-permalink-after.html'
});

/**
 * Created by samsan on 9/25/17.
 */

angular.module('viewCustom').controller('prmSearchBarAfterCtrl', ['$element', '$location', '$compile', '$scope', '$mdMedia', function ($element, $location, $compile, $scope, $mdMedia) {
    var vm = this;

    vm.$onInit = function () {
        var el = $element[0].parentNode.children[0].children[0].children[2];
        var button = document.createElement('button');
        button.setAttribute('id', 'browseButton');
        button.setAttribute('class', 'md-button md-primoExplore-theme browse-button');
        button.setAttribute('ng-click', 'vm.gotoBrowse()');
        var textNode = document.createTextNode('STARTS WITH (BROWSE BY...)');
        if ($mdMedia('xs') || $mdMedia('sm')) {
            textNode = document.createTextNode('BROWSE');
        }
        button.appendChild(textNode);
        var browseBtn = document.getElementById('browseButton');
        // if browse button doesn't exist, add new one
        if (!browseBtn) {
            el.appendChild(button);
            $compile(el)($scope);
        }
    };

    vm.gotoBrowse = function () {
        $location.path('/browse');
    };
}]);

angular.module('viewCustom').component('prmSearchBarAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmSearchBarAfterCtrl',
    controllerAs: 'vm'
});

/**
 * Created by samsan on 9/13/17.
 */

angular.module('viewCustom').controller('prmSearchResultAvailabilityLineAfterCtrl', ['customMapService', '$timeout', 'customHathiTrustService', 'customService', 'customGoogleAnalytic', '$q', 'prmSearchService', function (customMapService, $timeout, customHathiTrustService, customService, customGoogleAnalytic, $q, prmSearchService) {
    var vm = this;
    var cga = customGoogleAnalytic;
    var custService = customService;
    var cs = customMapService;
    var chts = customHathiTrustService;
    var prmsv = prmSearchService;
    // get endpoint url from config.html file
    vm.api = custService.getApi();
    // display of table of content
    vm.TOC = { 'type': 'HVD_ALEPH', 'isbn': [], 'display': false };
    vm.itemPNX = {};
    vm.hathiTrust = {};
    var map;

    // find if pnx has table of content
    vm.findTOC = function () {
        if (vm.itemPNX.pnx.control.sourceid[0] === vm.TOC.type && vm.itemPNX.pnx.addata.isbn) {
            if (vm.itemPNX.pnx.addata.isbn.length > 1) {
                var listRequest = [];
                for (var i = 0; i < vm.itemPNX.pnx.addata.isbn.length; i++) {
                    var param = { 'isbn': '', 'hasData': false };
                    param.isbn = vm.itemPNX.pnx.addata.isbn[i];
                    var post = custService.postData(vm.api.tocUrl, param);
                    listRequest.push(post);
                }
                // put everything into a list of queue call
                var ajax = $q.all(listRequest);
                ajax.then(function (response) {
                    for (var k = 0; k < response.length; k++) {
                        var data = response[k].data;
                        var xmldata = prmsv.parseXml(data.result);
                        if (xmldata.ssi) {
                            // it has table of content
                            if (xmldata.ssi[0].TOC[0]) {
                                data.hasData = true;
                                vm.TOC.display = data.hasData;
                                vm.TOC.isbn = data.isbn;
                                k = response.length;
                            }
                        } else {
                            // it doesn't have table of content
                            data.hasData = false;
                            vm.TOC.display = data.hasData;
                        }
                    }
                }, function (error) {
                    console.log(error);
                });
            } else if (vm.itemPNX.pnx.addata.isbn) {
                vm.TOC.display = true;
                vm.TOC.isbn = vm.itemPNX.pnx.addata.isbn[0];
            }
        }
    };

    //This function is used to center and zoom the map based on WKT POINT(x y)
    vm.mapWKTPoint = function (map, wkt, popupText) {
        if (popupText === "") {
            popupText = "<b>Center of data set coverage area.</b>";
        }

        var y = wkt[0];
        var x = wkt[2];

        // create a marker symbol on the map
        L.marker([x, y]).addTo(map).bindPopup(popupText);

        // pan to the marker symbol
        map.panTo(new L.LatLng(x, y));
    };

    //This function is used to center and zoom the map based on WKT BBOX(x1 y1, x2 y2)
    vm.mapWKTBbox = function (map, wkt, popupText) {
        if (popupText === "") {
            popupText = "<b>Extent of data set.</b>";
        }

        // define rectangle geographical bounds
        var bounds = [[wkt[2], wkt[0]], [wkt[3], wkt[1]]];

        // create an orange rectangle
        L.rectangle(bounds, {
            color: "#ff7800",
            weight: 1
        }).addTo(map).bindPopup(popupText);

        // zoom the map to the rectangle bounds
        map.fitBounds(bounds, {
            padding: [10, 10]
        });
    };

    vm.$onInit = function () {
        vm.itemPNX = vm.parentCtrl.result;
        // get table of content
        vm.findTOC();
        if (vm.itemPNX.pnx.display.lds40 && vm.parentCtrl.isFullView) {
            $timeout(function () {
                vm.coordinates = cs.buildCoordinatesArray(vm.itemPNX.pnx.display.lds40[0]);
                vm.centerLongitude = (vm.coordinates[0] + vm.coordinates[1]) / 2;
                vm.centerLatitude = (vm.coordinates[2] + vm.coordinates[3]) / 2;

                var zoom = 8;
                map = L.map('hglMap12', { center: [vm.centerLatitude, vm.centerLongitude],
                    zoom: zoom, keyboard: true, tap: true, zoomControl: false });

                // create the tile layer with correct attribution
                var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
                var osm = new L.TileLayer(osmUrl, { minZoom: zoom, maxZoom: 40, attribution: osmAttrib });

                map.setView([vm.centerLatitude, vm.centerLongitude], zoom);
                map.addLayer(osm);

                // custom zoom bar control that includes a Zoom Home function
                L.Control.zoomHome = L.Control.extend({
                    options: {
                        position: 'topleft',
                        zoomInText: '<i class="iconMapFontSize">+</i>',
                        zoomInTitle: 'Zoom in',
                        zoomOutText: '<i class="iconMapFontSize">-</i>',
                        zoomOutTitle: 'Zoom out',
                        zoomHomeText: '<img class="iconHome" src="/primo-explore/custom/HVD2/img/ic_home_black_18px.svg"/>',
                        zoomHomeTitle: 'Zoom home'
                    },

                    onAdd: function onAdd(map) {
                        var controlName = 'gin-control-zoom',
                            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
                            options = this.options;

                        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle, controlName + '-in', container, this._zoomIn);
                        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle, controlName + '-out', container, this._zoomOut);

                        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle, controlName + '-home', container, this._zoomHome);

                        this._updateDisabled();
                        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

                        return container;
                    },

                    onRemove: function onRemove(map) {
                        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
                    },

                    _zoomIn: function _zoomIn(e) {
                        this._map.zoomIn(e.shiftKey ? 3 : 1);
                    },

                    _zoomOut: function _zoomOut(e) {
                        this._map.zoomOut(e.shiftKey ? 3 : 1);
                        if (vm.itemPNX.pnx.display) {
                            var title = 'zoom-out: ' + vm.itemPNX.pnx.display.title[0];
                            cga.setPage('user-use-openMapStreet', title);
                        }
                    },

                    _zoomHome: function _zoomHome(e) {
                        map.setView([vm.centerLatitude, vm.centerLongitude], zoom);

                        if (vm.coordinates[0] == vm.coordinates[1] && vm.coordinates[2] == vm.coordinates[3]) {
                            vm.mapWKTPoint(map, vm.coordinates, "Center of data set coverage area.");
                        } else {
                            vm.mapWKTBbox(map, vm.coordinates, "Extent of data set.");
                        }
                    },

                    _createButton: function _createButton(html, title, className, container, fn) {
                        var link = L.DomUtil.create('a', className, container);
                        link.innerHTML = html;
                        link.href = '#';
                        link.title = title;

                        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation).on(link, 'click', L.DomEvent.stop).on(link, 'click', fn, this).on(link, 'click', this._refocusOnMap, this);

                        return link;
                    },

                    _updateDisabled: function _updateDisabled() {
                        var map = this._map,
                            className = 'leaflet-disabled';

                        L.DomUtil.removeClass(this._zoomInButton, className);
                        L.DomUtil.removeClass(this._zoomOutButton, className);

                        if (map._zoom === map.getMinZoom()) {
                            L.DomUtil.addClass(this._zoomOutButton, className);
                        }
                        if (map._zoom === map.getMaxZoom()) {
                            L.DomUtil.addClass(this._zoomInButton, className);
                        }
                    }
                });

                var zoomHome = new L.Control.zoomHome();
                zoomHome.addTo(map);

                // end here

                if (vm.coordinates[0] == vm.coordinates[1] && vm.coordinates[2] == vm.coordinates[3]) {
                    vm.mapWKTPoint(map, vm.coordinates, "Center of data set coverage area.");
                } else {
                    vm.mapWKTBbox(map, vm.coordinates, "Extent of data set.");
                }
            }, 1000);
        }

        // validate Hathi Trust to see if it is existed
        vm.hathiTrust = chts.validateHathiTrust(vm.itemPNX);
        vm.api = {};
        vm.hathiTrustItem = {};

        vm.getHathiTrustData = function () {
            if (vm.api.hathiTrustUrl) {
                chts.doPost(vm.api.hathiTrustUrl, vm.hathiTrust).then(function (data) {
                    if (data.data.items) {
                        vm.hathiTrustItem = chts.validateHarvard(data.data.items);
                    }
                }, function (error) {
                    console.log(error);
                });
            }
        };

        if (vm.hathiTrust.flag) {
            // get rest endpoint url from config.html where it preload prm-tobar-after.js
            vm.api = custService.getApi();
            vm.getHathiTrustData();
        }
    };
}]);

angular.module('viewCustom').component('prmSearchResultAvailabilityLineAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmSearchResultAvailabilityLineAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-search-result-availability-line-after.html'
});

/**
 * Created by samsan on 9/25/17.
 */

angular.module('viewCustom').controller('prmSearchResultListAfterCtrl', ['customGoogleAnalytic', function (customGoogleAnalytic) {
    var vm = this;
    var cga = customGoogleAnalytic;
    //capture search result and report to google analytic
    vm.$onChanges = function () {
        cga.setPage('/search', vm.parentCtrl.query);
    };
}]);

angular.module('viewCustom').component('prmSearchResultListAfter', {
    bindings: { parentCtrl: '<' },
    controllerAs: 'vm',
    controller: 'prmSearchResultListAfterCtrl'
});

/**
 * Created by samsan on 5/12/17.
 * This custom service use to inject to the controller.
 */

angular.module('viewCustom').service('prmSearchService', ['$http', '$window', '$filter', function ($http, $window, $filter) {
    var serviceObj = {};

    serviceObj.getPlatform = function () {
        var userAgent = $window.navigator.userAgent;
        var browsers = { ios: /ios/i, android: /android/i, blackberry: /blackberry/i, tablet: /tablet/i, iphone: /iphone/i, ipad: /ipad/i, samsung: /samsung/i };
        for (var key in browsers) {
            if (browsers[key].test(userAgent)) {
                return key;
            }
        };

        return '';
    };

    serviceObj.getBrowserType = function () {
        var userAgent = $window.navigator.userAgent;
        var browsers = { chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i };
        for (var key in browsers) {
            if (browsers[key].test(userAgent)) {
                return key;
            }
        };

        return '';
    };

    //http ajax service, pass in URL, parameters, method. The method can be get, post, put, delete
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

    // default page info
    serviceObj.page = { 'pageSize': 50, 'totalItems': 0, 'currentPage': 1, 'query': '', 'searchString': '', 'totalPages': 0, 'offset': 0, 'userClick': false };
    // getter for page info
    serviceObj.getPage = function () {
        // localStorage page info exist, just use the old one
        if ($window.localStorage.getItem('pageInfo')) {
            return JSON.parse($window.localStorage.getItem('pageInfo'));
        } else {
            return serviceObj.page;
        }
    };

    // setter for page info
    serviceObj.setPage = function (pageInfo) {
        // store page info on client browser by using html 5 local storage
        if ($window.localStorage.getItem('pageInfo')) {
            $window.localStorage.removeItem('pageInfo');
        }
        $window.localStorage.setItem('pageInfo', JSON.stringify(pageInfo));
        serviceObj.page = pageInfo;
    };

    // clear local storage
    serviceObj.removePageInfo = function () {
        if ($window.localStorage.getItem('pageInfo')) {
            $window.localStorage.removeItem('pageInfo');
        }
    };

    // replace & . It cause error in firefox;
    serviceObj.removeInvalidString = function (str) {
        var pattern = /[\&]/g;
        return str.replace(pattern, '&amp;');
    };

    //parse xml
    serviceObj.parseXml = function (str) {
        var options = {
            mergeCDATA: true, // extract cdata and merge with text nodes
            grokAttr: true, // convert truthy attributes to boolean, etc
            grokText: false, // convert truthy text/attr to boolean, etc
            normalize: true, // collapse multiple spaces to single space
            xmlns: true, // include namespaces as attributes in output
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

        str = serviceObj.removeInvalidString(str);
        return xmlToJSON.parseString(str, options);
    };

    // maninpulate data and convert xml data to json
    serviceObj.convertData = function (data) {
        var newData = [];
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            obj.restrictedImage = false;
            if (obj.pnx.addata.mis1) {
                if (obj.pnx.addata.mis1.length > 0) {
                    var jsonObj = serviceObj.getXMLdata(obj.pnx.addata.mis1[0]);
                    if (jsonObj.surrogate) {
                        for (var k = 0; k < jsonObj.surrogate.length; k++) {
                            if (jsonObj.surrogate[k].image) {
                                if (jsonObj.surrogate[k].image[0]._attr) {
                                    if (jsonObj.surrogate[k].image[0]._attr.restrictedImage._value) {
                                        obj.restrictedImage = true;
                                        k = jsonObj.surrogate.length;
                                    }
                                }
                            }
                        }
                    }
                    if (jsonObj.image) {
                        for (var k = 0; k < jsonObj.image.length; k++) {
                            if (jsonObj.image[k]._attr.restrictedImage) {
                                if (jsonObj.image[k]._attr.restrictedImage._value) {
                                    obj.restrictedImage = true;
                                    k = jsonObj.image.length;
                                }
                            }
                        }
                    }
                }
            }
            // remove the $$U infront of url
            if (obj.pnx.links.thumbnail) {
                var imgUrl = $filter('urlFilter')(obj.pnx.links.thumbnail);
                obj.pnx.links.thumbnail[0] = serviceObj.getHttps(imgUrl);
            }
            newData[i] = obj;
        }

        return newData;
    };

    // get user login ID
    serviceObj.logID = false;
    serviceObj.setLogInID = function (logID) {
        serviceObj.logID = logID;
    };

    serviceObj.getLogInID = function () {
        return serviceObj.logID;
    };

    // getter and setter for item data for view full detail page
    serviceObj.item = {};
    serviceObj.setItem = function (item) {
        serviceObj.item = item;
    };

    serviceObj.getItem = function () {
        return serviceObj.item;
    };

    // getter and setter for single image data
    serviceObj.data = {};
    serviceObj.setData = function (data) {
        serviceObj.data = data;
    };

    serviceObj.getData = function () {
        return serviceObj.data;
    };

    // getter and setter for selected facet
    serviceObj.facets = [];
    serviceObj.setFacets = function (data) {
        serviceObj.facets = data;
    };
    serviceObj.getFacets = function () {
        return serviceObj.facets;
    };

    // setter and getter for a single image
    serviceObj.photo = {};
    serviceObj.setPhoto = function (data) {
        serviceObj.photo = data;
    };
    serviceObj.getPhoto = function () {
        return serviceObj.photo;
    };

    // get user profile for authentication to login
    serviceObj.auth = {};
    serviceObj.setAuth = function (data) {
        serviceObj.auth = data;
    };
    serviceObj.getAuth = function () {
        return serviceObj.auth;
    };

    serviceObj.modalDialogFlag = false;
    serviceObj.setDialogFlag = function (flag) {
        serviceObj.modalDialogFlag = flag;
    };

    serviceObj.getDialogFlag = function () {
        return serviceObj.modalDialogFlag;
    };

    // replace http with https
    serviceObj.getHttps = function (url) {
        var pattern = /^(http:)/i;
        if (pattern.test(url)) {
            return url.replace(pattern, 'https:');
        } else {
            return url;
        }
    };

    // find image if it is jp2 or not
    serviceObj.findJP2 = function (itemData) {
        var flag = false;
        if (itemData.thumbnail) {
            var thumbnailUrl = itemData.thumbnail[0]._attr.href._value;
            var photoUrl = itemData._attr.href._value;
            var thumbnailList = thumbnailUrl.split(':');
            var thumbnailFlag = 0;
            if (thumbnailList.length > 0) {
                thumbnailFlag = thumbnailList[thumbnailList.length - 1];
            }
            var photoList = photoUrl.split(':');
            var photoFlag = 1;
            if (photoList.length > 0) {
                photoFlag = photoList[photoList.length - 1];
            }
            if (photoFlag === thumbnailFlag) {
                flag = true;
            }
        }
        return flag;
    };

    // convert xml data to json data by re-group them
    serviceObj.getXMLdata = function (str) {
        var xmldata = '';
        var listArray = [];
        if (str) {
            xmldata = serviceObj.parseXml(str);
            if (xmldata.work) {
                listArray = [];
                var work = xmldata.work[0];
                if (!work.surrogate && work.image) {
                    var data = work;
                    if (work.image.length === 1) {
                        listArray = data;
                    } else {
                        listArray = [];
                        var images = angular.copy(work.image);
                        delete work.image;
                        for (var i = 0; i < images.length; i++) {
                            data = angular.copy(work);
                            data.image = [];
                            data.image[0] = images[i];
                            listArray.push(data);
                        }
                    }
                } else if (work.surrogate && work.image) {
                    var data = {};
                    listArray = [];
                    var images = angular.copy(work.image);
                    var surrogate = angular.copy(work.surrogate);
                    delete work.image;
                    delete work.surrogate;
                    for (var i = 0; i < images.length; i++) {
                        data = angular.copy(work);
                        data.image = [];
                        data.image[0] = images[i];
                        listArray.push(data);
                    }

                    data = {};
                    for (var i = 0; i < surrogate.length; i++) {
                        data = surrogate[i];
                        if (surrogate[i].image) {
                            for (var j = 0; j < surrogate[i].image.length; j++) {
                                data = angular.copy(surrogate[i]);
                                if (surrogate[i].image[j]) {
                                    data.image = [];
                                    data.image[0] = surrogate[i].image[j];
                                    data.thumbnail = surrogate[i].image[j].thumbnail;
                                    data._attr = surrogate[i].image[j]._attr;
                                    data.caption = surrogate[i].image[j].caption;
                                }
                                listArray.push(data);
                            }
                        } else {
                            listArray.push(data);
                        }
                    }
                }

                if (work.subwork && !work.surrogate) {
                    listArray = [];
                    for (var i = 0; i < work.subwork.length; i++) {
                        var aSubwork = work.subwork[i];
                        if (aSubwork.surrogate) {
                            for (var j = 0; j < aSubwork.surrogate.length; j++) {
                                var data = aSubwork.surrogate[j];
                                listArray.push(data);
                            }
                        }
                        if (aSubwork.image) {
                            for (var k = 0; k < aSubwork.image.length; k++) {
                                var data = aSubwork;
                                data.thumbnail = aSubwork.image[k].thumbnail;
                                data._attr = aSubwork.image[k]._attr;
                                data.caption = aSubwork.image[k].caption;
                                listArray.push(data);
                            }
                        }
                        if (!aSubwork.image && !aSubwork.surrogate) {
                            listArray.push(aSubwork);
                        }
                    }
                }
                if (work.subwork && work.surrogate) {
                    listArray = [];
                    for (var i = 0; i < work.subwork.length; i++) {
                        var aSubwork = work.subwork[i];
                        if (aSubwork.surrogate) {
                            for (var j = 0; j < aSubwork.surrogate.length; j++) {
                                var data = aSubwork.surrogate[j];
                                listArray.push(data);
                            }
                        }
                        if (aSubwork.image) {
                            for (var k = 0; k < aSubwork.image.length; k++) {
                                var data = aSubwork;
                                data.thumbnail = aSubwork.image[k].thumbnail;
                                data._attr = aSubwork.image[k]._attr;
                                data.caption = aSubwork.image[k].caption;
                                listArray.push(data);
                            }
                        }
                    }
                    for (var w = 0; w < work.surrogate.length; w++) {
                        var aSurrogate = work.surrogate[w];
                        if (aSurrogate.surrogate) {
                            for (var j = 0; j < aSurrogate.surrogate.length; j++) {
                                var data = aSurrogate.surrogate[j];
                                listArray.push(data);
                            }
                        }
                        if (aSurrogate.image) {
                            for (var k = 0; k < aSurrogate.image.length; k++) {
                                var data = aSurrogate;
                                data.thumbnail = aSurrogate.image[k].thumbnail;
                                data._attr = aSurrogate.image[k]._attr;
                                data.caption = aSurrogate.image[k].caption;
                                listArray.push(data);
                            }
                        }
                    }
                }
                if (work.surrogate && !work.subwork) {
                    listArray = [];
                    for (var w = 0; w < work.surrogate.length; w++) {
                        var aSurrogate = work.surrogate[w];
                        if (aSurrogate.surrogate) {
                            for (var j = 0; j < aSurrogate.surrogate.length; j++) {
                                var data = aSurrogate.surrogate[j];
                                listArray.push(data);
                            }
                        }
                        if (aSurrogate.image) {
                            for (var k = 0; k < aSurrogate.image.length; k++) {
                                var data = angular.copy(aSurrogate);
                                data.image[0] = aSurrogate.image[k];
                                listArray.push(data);
                            }
                        }
                        if (!aSurrogate.image && !aSurrogate.surrogate) {
                            listArray.push(aSurrogate);
                        }
                    }
                }

                xmldata = work;
                if (listArray.length > 0) {
                    xmldata.surrogate = listArray;
                }

                /* end work section ***/
            } else if (xmldata.group) {
                listArray = [];
                xmldata = xmldata.group[0];
                if (xmldata.subwork && xmldata.surrogate) {
                    var listArray = [];
                    var subwork = xmldata.subwork;
                    var surrogate = xmldata.surrogate;
                    // get all the surrogate under subwork
                    for (var i = 0; i < subwork.length; i++) {
                        var aSubwork = subwork[i];
                        if (aSubwork.surrogate) {
                            for (var k = 0; k < aSubwork.surrogate.length; k++) {
                                var data = aSubwork.surrogate[k];
                                listArray.push(data);
                            }
                        }
                        if (aSubwork.image) {
                            for (var j = 0; j < aSubwork.image.length; j++) {
                                var data = aSubwork;
                                data.thumbnail = aSubwork.image[j].thumbnail;
                                data._attr = aSubwork.image[j]._attr;
                                data.caption = aSubwork.image[j].caption;
                                listArray.push(data);
                            }
                        }
                        if (!aSubwork.surrogate && !aSubwork.image) {
                            listArray.push(aSubwork);
                        }
                    }
                    // get all surrogate
                    for (var i = 0; i < surrogate.length; i++) {
                        var aSurrogate = surrogate[i];
                        if (aSurrogate.surrogate) {
                            for (var j = 0; j < aSurrogate.surrogate.length; j++) {
                                var data = aSurrogate.surrogate[j];
                                listArray.push(data);
                            }
                        }
                        if (aSurrogate.image) {
                            for (var j = 0; j < aSurrogate.image.length; j++) {
                                var data = aSurrogate;
                                data.thumbnail = aSurrogate.image[j].thumbnail;
                                data._attr = aSurrogate.image[j]._attr;
                                data.caption = aSurrogate.image[j].caption;
                                listArray.push(data);
                            }
                        }
                        if (!aSurrogate.surrogate && !aSurrogate.image) {
                            listArray.push(aSurrogate);
                        }
                    }
                    xmldata.surrogate = listArray;
                } else if (xmldata.subwork && !xmldata.surrogate) {
                    // transfer subwork to surrogate
                    var surrogate = [];
                    listArray = [];
                    var subwork = angular.copy(xmldata.subwork);
                    delete xmldata.subwork;
                    for (var i = 0; i < subwork.length; i++) {
                        if (subwork[i].surrogate) {
                            surrogate = angular.copy(subwork[i].surrogate);
                            delete subwork[i].surrogate;
                            for (var k = 0; k < surrogate.length; k++) {
                                if (surrogate[k].image) {
                                    var images = angular.copy(surrogate[k].image);
                                    delete surrogate[k].image;
                                    for (var c = 0; c < images.length; c++) {
                                        var data = surrogate[k];
                                        data.image = [];
                                        data.image[0] = images[c];
                                        listArray.push(data);
                                    }
                                } else {
                                    listArray.push(surrogate[k]);
                                }
                            }
                        }
                        if (subwork[i].image) {
                            var images = angular.copy(subwork[i].image);
                            delete subwork[i].image;
                            for (var j = 0; j < images.length; j++) {
                                var data = subwork[i];
                                data.image = [];
                                data.image[0] = images[j];
                                listArray.push(data);
                            }
                        }
                    }

                    xmldata.surrogate = listArray;
                }
            }
        }
        return xmldata;
    };

    return serviceObj;
}]);

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

angular.module('viewCustom').controller('prmTopbarAfterCtrl', ['$element', '$timeout', 'customService', 'customGoogleAnalytic', function ($element, $timeout, customService, customGoogleAnalytic) {
    var vm = this;
    var cs = customService;
    var cga = customGoogleAnalytic;
    vm.api = {};

    // get rest endpoint Url
    vm.getUrl = function () {
        cs.getAjax('/primo-explore/custom/HVD2/html/config.html', '', 'get').then(function (res) {
            vm.api = res.data;
            cs.setApi(vm.api);
        }, function (error) {
            console.log(error);
        });
    };

    vm.topRightMenus = [{ 'title': 'Research Guides', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:portal_resguides', 'label': 'Go to Research guides' }, { 'title': 'Libraries / Hours', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:bannerfindlib', 'label': 'Go to Library hours' }, { 'title': 'All My Accounts', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:banneraccounts', 'label': 'Go to all my accounts' }, { 'title': 'Feedback', 'url': 'http://nrs.harvard.edu/urn-3:HUL.ois:hollis-v2-feedback', 'label': 'Go to Feedback' }, { 'title': 'Ask Us', 'url': 'http://nrs.harvard.edu/urn-3:hul.ois:dsref', 'label': 'Go to Ask Us' }];

    vm.$onInit = function () {
        // initialize google analytic
        cga.init();

        // pre-load config.html file
        vm.getUrl();

        $timeout(function () {
            // create new div for the top white menu
            var el = $element[0].parentNode.parentNode.parentNode.parentNode.parentNode;
            var div = document.createElement('div');
            div.setAttribute('id', 'customTopMenu');
            div.setAttribute('class', 'topMenu');
            // if the topMenu class does not exist, add it.
            var topMenu = document.getElementById('customTopMenu');
            if (topMenu === null) {
                el.prepend(div);
            }
            var el2 = $element[0].parentNode.children[1].children;
            if (el2) {
                // remove menu
                el2[2].remove();
                el2[2].remove();
            }

            // create script tag link leafletJS.com to use openstreetmap.org
            var bodyTag = document.getElementsByTagName('body')[0];
            var scriptTag = document.createElement('script');
            scriptTag.setAttribute('src', 'https://unpkg.com/leaflet@1.2.0/dist/leaflet.js');
            scriptTag.setAttribute('integrity', 'sha512-lInM/apFSqyy1o6s89K4iQUKg6ppXEgsVxT35HbzUupEVRh2Eu9Wdl4tHj7dZO0s1uvplcYGmt3498TtHq+log==');
            scriptTag.setAttribute('crossorigin', '');
            bodyTag.append(scriptTag);
            // create link tag
            var linkTag = document.createElement('link');
            linkTag.setAttribute('href', 'https://unpkg.com/leaflet@1.2.0/dist/leaflet.css');
            linkTag.setAttribute('integrity', 'sha512-M2wvCLH6DSRazYeZRIm1JnYyh22purTM+FDB5CsyxtQJYeKq83arPe5wgbNmcFXGqiSH2XR8dT/fJISVA1r/zQ==');
            linkTag.setAttribute('crossorigin', '');
            linkTag.setAttribute('rel', 'stylesheet');
            bodyTag.append(linkTag);
        }, 500);
    };
}]);

angular.module('viewCustom').component('prmTopbarAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmTopbarAfterCtrl',
    controllerAs: 'vm',
    templateUrl: '/primo-explore/custom/HVD2/html/prm-topbar-after.html'
});

/**
 * Created by samsan on 5/17/17.
 * This component is to insert images into online section
 */
angular.module('viewCustom').controller('prmViewOnlineAfterController', ['prmSearchService', '$window', '$location', 'customService', function (prmSearchService, $window, $location, customService) {

    var vm = this;

    var sv = prmSearchService;
    var cisv = customService;
    var auth = cisv.getAuth();
    var itemData = sv.getItem();
    vm.item = itemData.item;
    vm.searchData = itemData.searchData;
    vm.params = $location.search();
    vm.zoomButtonFlag = true;
    vm.viewAllComponetMetadataFlag = false;
    vm.singleImageFlag = false;
    vm.displayOnlineImage = false;

    vm.$onChanges = function () {
        auth = cisv.getAuth();
        vm.isLoggedIn = auth.isLoggedIn;
        // get item data from service
        itemData = sv.getItem();
        vm.item = itemData.item;
        vm.searchData = itemData.searchData;

        if (vm.item && vm.item.pnx) {
            // show image if it is HVD_VIA
            if (vm.item.pnx.control.sourceid) {
                var sourceid = vm.item.pnx.control.sourceid;
                if (sourceid.indexOf('HVD_VIA') !== -1) {
                    vm.displayOnlineImage = true;
                }
            }
            if (vm.displayOnlineImage) {
                var data = sv.getXMLdata(vm.item.pnx.addata.mis1[0]);
                if (data.surrogate) {
                    vm.item.mis1Data = data.surrogate;
                } else if (data.image) {
                    if (data.image.length === 1) {
                        vm.item.mis1Data = [];
                        vm.item.mis1Data.push(data);
                    } else {
                        vm.item.mis1Data = data.image;
                    }
                } else {
                    vm.item.mis1Data = [];
                    vm.item.mis1Data.push(data);
                }
            }
        }

        if (vm.isLoggedIn === false && vm.item.mis1Data && vm.displayOnlineImage) {
            if (vm.item.mis1Data.length === 1) {
                if (vm.item.mis1Data[0].image) {
                    if (vm.item.mis1Data[0].image[0]._attr.restrictedImage) {
                        if (vm.item.mis1Data[0].image[0]._attr.restrictedImage._value) {
                            vm.zoomButtonFlag = false;
                        }
                    }
                } else if (vm.item.mis1Data[0]._attr) {
                    if (vm.item.mis1Data[0]._attr.restrictedImage) {
                        if (vm.item.mis1Data[0]._attr.restrictedImage._value) {
                            vm.zoomButtonFlag = false;
                        }
                    }
                }
            }
        }

        if (vm.item.mis1Data && vm.displayOnlineImage) {
            if (vm.item.mis1Data.length == 1) {
                vm.singleImageFlag = true;
            } else {
                vm.viewAllComponetMetadataFlag = true;
            }
        } else {
            vm.singleImageFlag = true;
        }

        // check to see if lds41 is exist
        if (vm.item.pnx.display.lds41) {
            vm.singleImageFlag = false;
            vm.viewAllComponetMetadataFlag = false;
        }
    };

    // view all component metadata
    vm.viewAllComponentMetaData = function () {
        var url = '/primo-explore/viewallcomponentmetadata/' + vm.item.context + '/' + vm.item.pnx.control.recordid[0] + '?vid=' + vm.params.vid;
        url += '&tab=' + vm.params.tab + '&search_scope=' + vm.params.search_scope;
        url += '&lang=' + vm.params.lang;
        url += '&adaptor=' + vm.params.adaptor;
        $window.open(url, '_blank');
    };

    // show the pop up image
    vm.gotoFullPhoto = function ($event, item, index) {
        // go to full display page
        var url = '/primo-explore/viewcomponent/' + vm.item.context + '/' + vm.item.pnx.control.recordid[0] + '/' + index + '?vid=' + vm.searchData.vid + '&lang=' + vm.searchData.lang;
        if (vm.item.adaptor) {
            url += '&adaptor=' + vm.item.adaptor;
        } else {
            url += '&adaptor=' + (vm.searchData.adaptor ? vm.searchData.adaptor : '');
        }
        $window.open(url, '_blank');
    };
}]);

angular.module('viewCustom').config(function ($stateProvider) {
    $stateProvider.state('exploreMain.viewallcomponentdata', {
        url: '/viewallcomponentmetadata/:context/:docid',
        views: {
            '': {
                template: '<custom-view-all-component-metadata parent-ctrl="$ctrl"></custom-view-all-component-metadata>'
            }
        }
    }).state('exploreMain.viewcomponent', {
        url: '/viewcomponent/:context/:docid/:index',
        views: {
            '': {
                template: '<custom-view-component parent-ctrl="$ctrl" item="$ctrl.item" services="$ctrl.services" params="$ctrl.params"></custom-view-component>'
            }
        }
    });
}).component('prmViewOnlineAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmViewOnlineAfterController',
    'templateUrl': '/primo-explore/custom/HVD2/html/prm-view-online-after.html'
});

/**
 * Created by samsan on 5/23/17.
 * If image width is greater than 600pixel, it will resize base on responsive css.
 * It use to show a single image on the page. If the image does not exist, it use icon_image.png
 */

angular.module('viewCustom').component('responsiveImage', {
    templateUrl: '/primo-explore/custom/HVD2/html/responsiveImage.html',
    bindings: {
        src: '<',
        imgtitle: '<',
        restricted: '<'
    },
    controllerAs: 'vm',
    controller: ['$element', '$window', '$location', 'prmSearchService', '$timeout', 'customService', function ($element, $window, $location, prmSearchService, $timeout, customService) {
        var vm = this;
        var sv = prmSearchService;
        var cisv = customService;
        var auth = cisv.getAuth();
        // set up local scope variables
        vm.showImage = true;
        vm.params = $location.search();
        vm.localScope = { 'imgClass': '', 'loading': true, 'hideLockIcon': false };
        vm.isLoggedIn = auth.isLoggedIn;

        // check if image is not empty and it has width and height and greater than 150, then add css class
        vm.$onChanges = function () {
            auth = cisv.getAuth();
            vm.isLoggedIn = auth.isLoggedIn;
            if (vm.restricted && !vm.isLoggedIn) {
                vm.showImage = false;
            }
            vm.localScope = { 'imgClass': '', 'loading': true, 'hideLockIcon': false };
            if (vm.src && vm.showImage) {
                $timeout(function () {
                    var img = $element.find('img')[0];
                    // use default image if it is a broken link image
                    var pattern = /^(onLoad\?)/; // the broken image start with onLoad
                    if (pattern.test(vm.src)) {
                        img.src = '/primo-explore/custom/HVD_IMAGES/img/icon_image.png';
                    }
                    img.onload = vm.callback;
                    if (img.width > 50) {
                        vm.callback();
                    }
                }, 200);
            }

            vm.localScope.loading = false;
        };
        vm.callback = function () {
            var image = $element.find('img')[0];
            // resize the image if it is larger than 600 pixel
            if (image.width > 600) {
                vm.localScope.imgClass = 'responsiveImage';
                image.className = 'md-card-image ' + vm.localScope.imgClass;
            }

            // force to show lock icon
            if (vm.restricted) {
                vm.localScope.hideLockIcon = true;
            }
        };
        // login
        vm.signIn = function () {
            var auth = cisv.getAuth();
            var params = { 'vid': '', 'targetURL': '' };
            params.vid = vm.params.vid;
            params.targetURL = $window.location.href;
            var url = '/primo-explore/login?from-new-ui=1&authenticationProfile=' + auth.authenticationMethods[0].profileName + '&search_scope=default_scope&tab=default_tab';
            url += '&Institute=' + auth.authenticationService.userSessionManagerService.userInstitution + '&vid=' + params.vid;
            if (vm.params.offset) {
                url += '&offset=' + vm.params.offset;
            }
            url += '&targetURL=' + encodeURIComponent(params.targetURL);
            $window.location.href = url;
        };
    }]
});

/**
 * Created by samsan on 5/23/17.
 * If image width is greater than 600pixel, it will resize base on responsive css.
 * It use to show a single image on the page. If the image does not exist, it use icon_image.png
 */

angular.module('viewCustom').component('singleImage', {
    templateUrl: '/primo-explore/custom/HVD2/html/singleImage.html',
    bindings: {
        src: '<',
        imgtitle: '<',
        restricted: '<',
        jp2: '<'
    },
    controllerAs: 'vm',
    controller: ['$element', '$window', '$location', 'prmSearchService', '$timeout', '$sce', 'customService', function ($element, $window, $location, prmSearchService, $timeout, $sce, customService) {
        var vm = this;
        var sv = prmSearchService;
        var cisv = customService;
        // set up local scope variables
        vm.imageUrl = '';
        vm.showImage = true;
        vm.params = $location.search();
        vm.localScope = { 'imgClass': '', 'loading': true, 'hideLockIcon': false };
        vm.auth = cisv.getAuth();
        vm.isLoggedIn = vm.auth.isLoggedIn;

        // check if image is not empty and it has width and height and greater than 150, then add css class
        vm.$onChanges = function () {
            vm.auth = cisv.getAuth();
            vm.isLoggedIn = vm.auth.isLoggedIn;
            if (vm.restricted && !vm.isLoggedIn) {
                vm.showImage = false;
            }
            vm.localScope = { 'imgClass': '', 'loading': true, 'hideLockIcon': false };
            if (vm.src && vm.showImage) {
                if (vm.jp2 === true) {
                    var url = sv.getHttps(vm.src) + '?buttons=Y';
                    vm.imageUrl = $sce.trustAsResourceUrl(url);
                } else {
                    vm.imageUrl = vm.src;
                    $timeout(function () {
                        var img = $element.find('img')[0];
                        // use default image if it is a broken link image
                        var pattern = /^(onLoad\?)/; // the broken image start with onLoad
                        if (pattern.test(vm.src)) {
                            img.src = '/primo-explore/custom/HVD2/img/icon_image.png';
                        }
                        img.onload = vm.callback;
                        if (img.width > 600) {
                            vm.callback();
                        }
                    }, 300);
                }
            } else {
                vm.imageUrl = '';
            }

            vm.localScope.loading = false;
        };

        vm.callback = function () {
            var image = $element.find('img')[0];
            // resize the image if it is larger than 600 pixel
            if (image.width > 600) {
                vm.localScope.imgClass = 'responsiveImage';
                image.className = 'md-card-image ' + vm.localScope.imgClass;
            }

            // force to show lock icon
            if (vm.restricted) {
                vm.localScope.hideLockIcon = true;
            }
        };

        // login
        vm.signIn = function () {
            var auth = cisv.getAuth();
            var params = { 'vid': '', 'targetURL': '' };
            params.vid = vm.params.vid;
            params.targetURL = $window.location.href;
            var url = '/primo-explore/login?from-new-ui=1&authenticationProfile=' + auth.authenticationMethods[0].profileName + '&search_scope=default_scope&tab=default_tab';
            url += '&Institute=' + auth.authenticationService.userSessionManagerService.userInstitution + '&vid=' + params.vid;
            if (vm.params.offset) {
                url += '&offset=' + vm.params.offset;
            }
            url += '&targetURL=' + encodeURIComponent(params.targetURL);
            $window.location.href = url;
        };
    }]
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