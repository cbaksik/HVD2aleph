(function(){
"use strict";
'use strict';

/**
 * Created by samsan on 7/18/17.
 */

angular.module('viewCustom', ['angularLoad']);

/**
 * Created by samsan on 7/18/17.
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
        str = serviceObj.removeInvalidString(str);
        return xmlToJSON.parseString(str);
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
        for (var i = 0; i < serviceObj.logicList.mainlocationcode.length; i++) {
            var data = serviceObj.logicList.mainlocationcode[i];
            if (data._attr.id._value === currLoc.location.mainLocation) {
                item = data;
                i = serviceObj.logicList.mainlocationcode.length;
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

    return serviceObj;
}]);

/**
 * Created by samsan on 7/18/17.
 */
angular.module('viewCustom').controller('prmLocationItemAfterCtrl', ['$element', 'customService', function ($element, customService) {
    var vm = this;
    vm.currLoc = {};
    vm.locationInfo = {};
    vm.parentData = {};
    vm.itemsCategory = [{ 'itemcategorycode': '02', 'itemstatusname': 'Not checked out', 'processingstatus': '', 'queue': '' }]; // json data object from getItemCategoryCodes ajax call
    vm.logicList = []; // store logic list from the xml file
    vm.requestLinks = [];
    var sv = customService;

    // get static xml data and convert to json
    vm.getLibData = function () {
        vm.logicList = sv.getLogicList();
        if (vm.logicList.length === 0) {
            sv.getAjax('/primo-explore/custom/HVD2/lib/requestLinkLogic.xml', {}, 'get').then(function (respone) {
                if (respone.status === 200) {
                    var data = sv.convertXML(respone.data);
                    if (data.requestlinkconfig) {
                        vm.logicList = data.requestlinkconfig[0];
                        sv.setLogicList(vm.logicList);
                        vm.locationInfo = sv.getLocation(vm.currLoc);
                    } else {
                        console.log('*** It cannot access requestlinkconfig data ***');
                        console.log(data);
                    }
                }
            }, function (err) {
                console.log(err);
            });
        } else {
            vm.locationInfo = sv.getLocation(vm.currLoc);
        }
    };

    // get item category code
    vm.getItemCategoryCodes = function () {
        var url = vm.parentData.opacService.restBaseURLs.ILSServicesBaseURL + '/holdings';
        var jsonObj = { 'filters': { 'callnumber': '', 'collection': '', 'holid': '', ilsRecordList: [{ 'institution': 'HVD', 'recordId': '' }], 'noItem': 6, 'startPos': 1, 'sublibrary': 'WID', 'sublibs': 'WID', 'vid': 'HVD2' }, 'locations': [] };
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
                vm.compare();
            }
        }, function (err) {
            console.log(err);
        });
    };

    // make comparison to see it is true so it can display the link
    vm.compare = function () {
        // get requestItem
        if (vm.locationInfo.requestItem) {
            var requestItem = { 'flag': false, 'item': {}, 'type': 'requestItem', 'text': 'Request Item' };

            for (var i = 0; i < vm.locationInfo.requestItem[0].json.length; i++) {
                var json = vm.locationInfo.requestItem[0].json[i];

                for (var j = 0; j < vm.itemsCategory.length; j++) {
                    var itemCat = vm.itemsCategory[j].items;

                    for (var w = 0; w < itemCat.length; w++) {
                        var item = itemCat[w];

                        var itemCategoryCodeList = '';
                        if (json._attr.itemcategorycode) {
                            itemCategoryCodeList = json._attr.itemcategorycode._value;
                            itemCategoryCodeList = itemCategoryCodeList.toString();
                        }
                        var itemStatusNames = '';
                        if (json._attr.itemstatusname) {
                            itemStatusNames = json._attr.itemstatusname._value;
                        }
                        var processingStatusList = '';
                        if (json._attr.processingstatus) {
                            processingStatusList = json._attr.processingstatus._value;
                        }
                        var queueList = '';
                        if (json._attr.queue) {
                            queueList = json._attr.queue._value;
                        }

                        if (itemCategoryCodeList) {
                            var patternCategoryCode = new RegExp(item.itemcategorycode);
                            if (patternCategoryCode.test(itemCategoryCodeList)) {
                                var patternStatusName = new RegExp(item.itemstatusname);
                                if (patternStatusName.test(itemStatusNames)) {
                                    if (processingStatusList === 'NULL' && item.processingstatus === '') {
                                        requestItem.flag = true;
                                        requestItem.item = item;
                                        i = vm.locationInfo.requestItem[0].json.length;
                                    } else if (processingStatusList && item.processingstatus) {
                                        var patternProcessStatus = new RegExp(item.processingstatus);
                                        if (patternProcessStatus.test(processingStatusList)) {
                                            requestItem.flag = true;
                                            requestItem.item = item;
                                            i = vm.locationInfo.requestItem[0].json.length;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // push to array
            vm.requestLinks.push(requestItem);
        }
        // scan & delivery
        if (vm.locationInfo.scanDeliver) {
            var scanDeliver = { 'flag': false, 'item': {}, 'type': 'scanDeliver', 'text': 'Scan & Delivery' };
            for (var i = 0; i < vm.locationInfo.scanDeliver[0].json.length; i++) {
                var json = vm.locationInfo.scanDeliver[0].json[i];
                for (var j = 0; j < vm.itemsCategory.length; j++) {
                    var itemCat = vm.itemsCategory[j].items;

                    for (var w = 0; w < itemCat.length; w++) {
                        var item = itemCat[w];

                        var itemCategoryCodeList = '';
                        if (json._attr.itemcategorycode) {
                            itemCategoryCodeList = json._attr.itemcategorycode._value;
                            itemCategoryCodeList = itemCategoryCodeList.toString();
                        }
                        var itemStatusNames = '';
                        if (json._attr.itemstatusname) {
                            itemStatusNames = json._attr.itemstatusname._value;
                        }
                        var processingStatusList = '';
                        if (json._attr.processingstatus) {
                            processingStatusList = json._attr.processingstatus._value;
                        }
                        var queueList = '';
                        if (json._attr.queue) {
                            queueList = json._attr.queue._value;
                        }

                        if (itemCategoryCodeList) {
                            var patternCategoryCode = new RegExp(item.itemcategorycode);
                            if (patternCategoryCode.test(itemCategoryCodeList)) {
                                var patternStatusName = new RegExp(item.itemstatusname);
                                if (patternStatusName.test(itemStatusNames)) {
                                    if (processingStatusList === 'NULL' && item.processingstatus === '') {
                                        scanDeliver.flag = true;
                                        scanDeliver.item = item;
                                        i = vm.locationInfo.scanDeliver[0].json.length;
                                    } else if (processingStatusList && item.processingstatus) {
                                        var patternProcessStatus = new RegExp(item.processingstatus);
                                        if (patternProcessStatus.test(processingStatusList)) {
                                            scanDeliver.flag = true;
                                            scanDeliver.item = item;
                                            i = vm.locationInfo.scanDeliver[0].json.length;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // push to array
            vm.requestLinks.push(scanDeliver);
        }
        // get aeonrequest
        if (vm.locationInfo.aeonrequest) {
            var aeonrequest = { 'flag': false, 'item': {}, 'type': 'aeonrequest', 'text': 'Schedule visit' };
            for (var i = 0; i < vm.locationInfo.aeonrequest[0].json.length; i++) {
                var json = vm.locationInfo.aeonrequest[0].json[i];
                for (var j = 0; j < vm.itemsCategory.length; j++) {
                    var itemCat = vm.itemsCategory[j].items;

                    for (var w = 0; w < itemCat.length; w++) {
                        var item = itemCat[w];

                        var itemCategoryCodeList = '';
                        if (json._attr.itemcategorycode) {
                            itemCategoryCodeList = json._attr.itemcategorycode._value;
                            itemCategoryCodeList = itemCategoryCodeList.toString();
                        }
                        var itemStatusNames = '';
                        if (json._attr.itemstatusname) {
                            itemStatusNames = json._attr.itemstatusname._value;
                        }
                        var processingStatusList = '';
                        if (json._attr.processingstatus) {
                            processingStatusList = json._attr.processingstatus._value;
                        }
                        var queueList = '';
                        if (json._attr.queue) {
                            queueList = json._attr.queue._value;
                        }

                        if (itemCategoryCodeList) {
                            var patternCategoryCode = new RegExp(item.itemcategorycode);
                            if (patternCategoryCode.test(itemCategoryCodeList)) {
                                var patternStatusName = new RegExp(item.itemstatusname);
                                if (patternStatusName.test(itemStatusNames)) {
                                    if (processingStatusList === 'NULL' && item.processingstatus === '') {
                                        aeonrequest.flag = true;
                                        aeonrequest.item = item;
                                        i = vm.locationInfo.aeonrequest[0].json.length;
                                    } else if (processingStatusList && item.processingstatus) {
                                        var patternProcessStatus = new RegExp(item.processingstatus);
                                        if (patternProcessStatus.test(processingStatusList)) {
                                            aeonrequest.flag = true;
                                            aeonrequest.item = item;
                                            i = vm.locationInfo.aeonrequest[0].json.length;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // push to array
            vm.requestLinks.push(aeonrequest);
        }

        console.log('*** vm.requestLinks ***');
        console.log(vm.requestLinks);
    };

    vm.$onInit = function () {
        vm.getLibData();
        console.log('*** OnInit ****');
        console.log(vm);
    };

    vm.$onChanges = function (ev) {
        // get data from prm-location-items-after component
        vm.data = sv.getItems();
        vm.currLoc = vm.data.currLoc;
        // get data from prm-locations-after component
        vm.parentData = sv.getParentData();

        vm.getItemCategoryCodes();

        console.log('*** onChanges ***');
        console.log(vm);
    };

    vm.$doCheck = function () {

        console.log('**** doCheck ****');
        console.log(vm);
    };

    vm.goto = function (index) {
        console.log('*** goto ***');
        console.log(index);
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
 */
angular.module('viewCustom').controller('prmLocationItemsAfterCtrl', ['customService', function (customService) {
    var vm = this;
    var sv = customService;

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

angular.module('viewCustom').controller('prmSearchResultListAfterController', ['$sce', 'angularLoad', function ($sce, angularLoad) {
    var vm = this;
    vm.items = vm.parentCtrl.searchResults;

    vm.tiles = buildGridModel({
        icon: "prm-grid-image-",
        title: "",
        background: ""
    });

    function buildGridModel(tileTmpl) {
        var it,
            results = [];

        var images = {
            0: 'sports',
            1: 'abstract',
            2: 'animals',
            3: 'nature',
            4: 'transport',
            5: 'cats'

        };
        for (var j = 0; j < vm.items.length; j++) {

            it = angular.extend({}, tileTmpl);
            it.icon = it.icon + (images[j % 5] || 'food');
            console.log(vm.items);
            it.title = vm.items[j].pnx.display.title[0] || '';
            it.span = { row: 1, col: 1 };

            switch (j + 1) {
                case 1:
                    it.background = "red";
                    it.span.row = it.span.col = 2;
                    break;

                case 2:
                    it.background = "green";break;
                case 3:
                    it.background = "darkBlue";break;
                case 4:
                    it.background = "blue";
                    it.span.col = 2;
                    break;

                case 5:
                    it.background = "yellow";
                    it.span.row = it.span.col = 2;
                    break;

                case 6:
                    it.background = "pink";break;
                case 7:
                    it.background = "darkBlue";break;
                case 8:
                    it.background = "purple";break;
                case 9:
                    it.background = "deepBlue";break;
                case 10:
                    it.background = "lightPurple";break;
                case 11:
                    it.background = "yellow";break;
            }

            results.push(it);
        }
        return results;
    }
    /* vm.$onInit = function () {
         angularLoad.loadScript('custom/HVD/img/avatar-icons.svg').then(function () {
             console.log('1111');
         });
     }*/
}]);

/*http://dc03kg0084eu.hosted.exlibrisgroup.com:8991/pds*/

angular.module('viewCustom').component('prmSearchResultListAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmSearchResultListAfterController',
    template: '<div class="gridListdemoDynamicTiles" flex ng-cloak>\n  <md-grid-list\n        md-cols="1" md-cols-sm="2" md-cols-md="3" md-cols-gt-md="6"\n        md-row-height-gt-md="1:1" md-row-height="4:3"\n        md-gutter="8px" md-gutter-gt-sm="4px" >\n\n    <md-grid-tile ng-repeat="tile in $ctrl.tiles"\n                  md-rowspan="{{tile.span.row}}"\n                  md-colspan="{{tile.span.col}}"\n                  md-colspan-sm="1"\n                  md-colspan-xs="1"\n                  ng-class="tile.background" >\n                  \n      <div class="prm-grid-image {{tile.icon}}"></div>\n      <md-grid-tile-footer><h3>{{tile.title}}</h3></md-grid-tile-footer>\n    </md-grid-tile>\n  </md-grid-list>\n</div>'
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