/**
 * Created by samsan on 8/18/17.
 */

angular.module('viewCustom')
    .service('hvdLibraryCodes',[function () {
        var svObj={};
        // add more library code and library name here
        svObj.codes=[
            {'code':'HVD_CAB','name':'Cabot science'},
            {'code':'HVD_MCZ','name':'Museum Comp Zoology'}
        ];

        svObj.getLibraryName=function(code) {
            var newCode=code;
            for(var i=0; i < svObj.codes.length; i++) {
                if(code===svObj.codes[i].code) {
                    newCode=svObj.codes[i].name;
                    i=svObj.codes.length;
                }
            }
            return newCode;
        };

        return svObj;
    }
    ]);



