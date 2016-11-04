import '../plugins/plugins';
import './Footer';
import './Topbar';
import './Search';
import './Playlist';
import './MediaPanel';
import '../modules/ui-kit/ui-kit';
import '../modules/playlist/playlist';
import '../modules/notifications/notifications';
import '../modules/sol-peerjs/peerjs-service';
import '../modules/sol-peerjs/sol-peerjs';
import '../modules/sol-backend/sol-backend';
import '../modules/user-playlists/user-playlists';
import '../modules/google-signin/google-signin';
import '../modules/peer-pane/peer-pane';
import '../modules/user-login/user-login';
import '../modules/ambiance-pane/ambiance-pane';

import 'angular';

const cacheUpdated = new Promise((resolve, reject) => {
    if (window.hasOwnProperty('applicationCache')) {
        window.applicationCache.addEventListener('updateready', function() {
            resolve();
        });
    }
});

export default angular.module('Application', [
    'ui.footer',
    'ui.topbar',
    'ui.search',
    'ui.media-panel',
    'ui.playlist',
    'ui-kit',
    'notifications',
    'peerjs-service',
    'sol-peerjs',
    'user-playlists',
    'peer-pane',
    'ambiance-pane',
    'user-login',
    'playlist',
    'services',
    'plugins'
]).constant('DATA_SOURCES', {
	ci: 'https://localhost.trackauthoritymusic.com',
	angular: 'https://localplayer.trackauthoritymusic.com',
	api : 'https://localhost.trackauthoritymusic.com'
}).directive('solarizdApp', ['$rootScope', 'ApiKey', 'playList', function($rootScope, ApiKey, playList) {
    return {
        restrict: 'E',
        templateUrl: '/html/app.html',
        replace: true,
        scope: true,
        link: function($scope, $element) {
            if (playList.playlist.length) {
                $scope.defaultTab = 1;
            } else {
                $scope.defaultTab = 0;
            }
    
	$scope.currentUser = false;
	$scope.isAuthenticated = false;
	
	$rootScope.currentUser = false;
	$rootScope.isAuthenticated = false;
	        	
	$scope.setCurrentUser = function (user) {
		console.log("setting global user", user);
		$scope.currentUser = user;
		if (user.user_id > 0) {
			$scope.isAuthenticated = user.group_user_status;
		}
	};

            ApiKey.fetchKeys().then(function() {
                $element[0].classList.add('loaded');
            });

            // Notify users when there's a new version
            cacheUpdated.then(() => {
                $rootScope.$broadcast('toast::notify', {
                    text: 'Reload this app to get a newer version',
                    persist: true
                });
            });
        }, 
        controller : function($scope, $rootScope) {
        	console.log('solarizdApp controller');
        	$scope.currentUser = false;
        	$scope.isAuthenticated = false;
        	$scope.setCurrentUser = function (user) {
        		console.log("setting global user from controller", user);
        		$scope.currentUser = user;
        		if (user.user_id > 0) {
        			$scope.isAuthenticated = user.group_user_status;
        		}
        	};
        }
    };
}]).controller('ApplicationController', function ($scope, $rootScope, DATA_SOURCES) {
	console.log('ApplicationController', DATA_SOURCES);
	$scope.currentUser = false;
	$scope.isAuthenticated = false;
	
	$rootScope.currentUser = false;
	$rootScope.isAuthenticated = false;

})
.config(["$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push('middleware');
}]).factory('middleware', function() {
    return {
        request: function(config) {
    		if (config.url.indexOf("trackauthoritymusic.com") > -1) {
        		console.log("HTTP REQUEST", config);
        		if (!config.headers || typeof config.headers != 'object') {
        			console.log('instantiating headers???');
        			config.headers = {};
        		}
        		config.withCredentials = true;
    			//config.headers['Access-Control-Allow-Credentials'] = true;
    			config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    		}
        	return config;
        },
//	   'requestError': function(rejection) {
//	      if (canRecover(rejection)) {
//	        return responseOrNewPromise
//	      }
//	      return $q.reject(rejection);
//	    },
//	    'response': function(response) {
//	      return response;
//	    },
//	   'responseError': function(rejection) {
//	      if (canRecover(rejection)) {
//	        return responseOrNewPromise
//	      }
//	      return $q.reject(rejection);
//	    }
    };
});
