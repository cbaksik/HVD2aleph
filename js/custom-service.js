/**
 * Created by samsan on 7/18/17.
 */

angular.module('viewCustom')
    .service('customService',['$http',function ($http) {
        var serviceObj={};

        serviceObj.getAjax=function (url,param,methodType) {
            return $http({
                'method':methodType,
                'url':url,
                'params':param
            })
        };

        serviceObj.postAjax=function (url,jsonObj) {
            return $http({
                'method':'post',
                'url':url,
                'data':jsonObj
            })
        };

        // setter and getter
        serviceObj.items={};
        serviceObj.setItems=function (data) {
            serviceObj.items=data;
        };
        serviceObj.getItems=function () {
            return serviceObj.items;
        };

        // replace & . It cause error in firefox;
        serviceObj.removeInvalidString=function (str) {
            var pattern = /[\&]/g;
            return str.replace(pattern, '&amp;');
        };

        //parse xml
        serviceObj.convertXML=function (str) {
            str=serviceObj.removeInvalidString(str);
            return xmlToJSON.parseString(str);
        };

        // setter and getter for library list data logic from xml file
        serviceObj.logicList=[];
        serviceObj.setLogicList=function (arr) {
            serviceObj.logicList=arr;
        };

        serviceObj.getLogicList=function () {
            return serviceObj.logicList;
        };

        // compare logic
        serviceObj.getLocation=function (currLoc) {
            var item='';
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
        serviceObj.parentData={};
        serviceObj.setParentData=function (data) {
            serviceObj.parentData=data;
        };
        serviceObj.getParentData=function () {
            return serviceObj.parentData;
        };


        return serviceObj;
    }]);
