/**
 * Created by samsan on 8/7/17.
 */

angular.module('viewCustom')
    .service('customImagesService',[function () {
        var serviceObj={};

        serviceObj.extractImageUrl=function (item, recordLinks) {
            if(item.pnx.links) {
                var lln02=item.pnx.links.lln02;
                for(var i=0; i < lln02.length; i++) {
                    var patternUrl = /^(\$\$U)/;
                }
            }
        };

        return serviceObj;
    }]);

