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

    serviceObj.postAjax = function (url, jsonObj, methodType) {
        return $http({
            'method': methodType,
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

        console.log('**** item **');
        console.log(item);
        console.log('*** currLoc ***');
        console.log(currLoc);

        return item;
    };

    return serviceObj;
}]);

/**
 * Created by samsan on 7/18/17.
 */

angular.module('viewCustom').controller('prmLocationAfterCtrl', ['$element', 'customService', function ($element, customService) {
    var vm = this;
    var sv = customService;

    vm.$onChanges = function () {

        console.log('*** prm-location-after ***');
        console.log(vm);
    };
}]);

angular.module('viewCustom').component('prmLocationAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmLocationAfterCtrl',
    controllerAs: 'vm'
});

/**
 * Created by samsan on 7/18/17.
 */
angular.module('viewCustom').controller('prmLocationItemAfterCtrl', ['$element', 'customService', function ($element, customService) {
    var vm = this;
    vm.currLoc = {};
    vm.locationInfo = {};
    vm.logicList = []; // store logic list from the xml file
    vm.requestLinks = { 'requestItem': false, 'scanDeliver': false, 'aeonRequest': false };
    var sv = customService;

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
            vm.locationInfo = sv.getLocation(vm.currLoc);
        }
    };

    vm.$onInit = function () {
        vm.getLibData();
    };

    vm.$onChanges = function (ev) {
        vm.data = sv.getItems();
        vm.currLoc = vm.data.currLoc;

        console.log('*** prm-location-item-after ***');
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
angular.module('viewCustom').controller('prmLocationItemsAfterCtrl', ['$element', 'customService', function ($element, customService) {
    var vm = this;
    var sv = customService;

    vm.$onChanges = function (ev) {
        console.log('*** prm-location-items-after ***');
        console.log(vm);
        sv.setItems(vm.parentCtrl);
        console.log(ev);
    };
}]);

angular.module('viewCustom').component('prmLocationItemsAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmLocationItemsAfterCtrl'
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