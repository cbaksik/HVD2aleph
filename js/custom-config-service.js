/**
* Created by gr on 1/11/2018
* A custom service for loading the configuration file
*/

angular.module('viewCustom')
    .service('customConfigService',['$http','$window','customService', function ($http, $window, customService) {

        let serviceObj = {};
        serviceObj.HVD_IMAGES_config = {};
        serviceObj.HVD2_config = {}

        // Get configuration file name for this environment
        serviceObj.getConfigFileName = function () {
            var host = $window.location.hostname;
            var configFileName = 'config-prod.html';
            if (host.toLowerCase() === 'localhost') {
                configFileName = 'config-local.html';
            } else if (host.toLowerCase() === 'harvard-primosb.hosted.exlibrisgroup.com') {
                configFileName = 'config-dev.html';
            } else if (host.toLowerCase() === 'qa.hollis.harvard.edu') {
                configFileName = 'config-dev.html';
            }
            return configFileName;
        };

        serviceObj.getHVD2Config = function () {
            if (angular.equals({},serviceObj.HVD2_config)) {
                var configFile = serviceObj.getConfigFileName();
                customService.getAjax('/primo-explore/custom/HVD2/html/' + configFile, '', 'get')
                    .then(function (res) {
                            serviceObj.setHVD2Config(res.data);
                        },
                        function (error) {
                            console.log(error);
                        }
                    )
            }
            return serviceObj.HVD2_config;
        };

        serviceObj.setHVD2Config=function (data) {
            serviceObj.HVD2_config=data;
        };

        serviceObj.getHVDImagesConfig = function () {
            if (angular.equals({},serviceObj.HVD_IMAGES_config)) {
                var configFile = serviceObj.getConfigFileName();
                customService.getAjax('/primo-explore/custom/HVD_IMAGES/html/' + configFile, '', 'get')
                    .then(function (res) {
                            serviceObj.setHVD2Config(res.data);
                        },
                        function (error) {
                            console.log(error);
                        }
                    )
            }
            return serviceObj.HVD_IMAGES_config;
        };

        serviceObj.setHVD2Config=function (data) {
            serviceObj.HVD2_config=data;
        };

        serviceObj.setHVDImagesConfig=function (data) {
            serviceObj.HVD_IMAGES_config=data;
        };

        return serviceObj;

    }]);