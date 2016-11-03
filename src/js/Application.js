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
import '../modules/user-login/user-login';
import '../modules/peer-pane/peer-pane';
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
    'sol-backend',
    'user-playlists',
    'peer-pane',
    'ambiance-pane',
    'user-login',
    'playlist',
    'services',
    'plugins'
]).directive('solarizdApp', ['$rootScope', 'ApiKey', 'playList', 'solBackend', function($rootScope, ApiKey, playList, solBackend) {
    return {
        restrict: 'E',
        templateUrl: '/html/app.html',
        replace: true,
        scope: true,
        link: function($scope, $element) {
            $scope.dataSources = {
            	assets: 'https://localplayer.trackauthoritymusic.com',
            	angular: 'https://localplayer.trackauthoritymusic.com',
            	api : 'https://localhost.trackauthoritymusic.com'
            };
            
            if (playList.playlist.length) {
                $scope.defaultTab = 1;
            } else {
                $scope.defaultTab = 0;
            }
            
        	$scope.currentUser = false;
//        	$scope.userRoles = USER_ROLES;
        	//$scope.isAuthorized = AuthService.isAuthorized(USER_ROLES);
        	$scope.isAuthenticated = false; // AuthService.isAuthenticated();
//        	console.log('is Authneticated: ', $scope.isAuthenticated);
        	$scope.setCurrentUser = function (user) {
        		console.log("setting global user", user);
        		$scope.currentUser = user;
        		if (user.user_id) {
        			$scope.isAuthenticated = user.user_status;
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
	    controller: function($scope, $element, $attrs, $transclude) {
	        $scope.dataSources = {
	        	assets: 'https://localplayer.trackauthoritymusic.com',
	        	angular: 'https://localplayer.trackauthoritymusic.com',
	        	api : 'https://localhost.trackauthoritymusic.com'
	        }
	    }   
    };
}])
//.config(["$httpProvider", function($httpProvider) {
//	//$httpProvider.defaults.withCredentials = true;
//	$httpProvider.defaults.headers.common['Access-Control-Allow-Credentials'] = true; 
//    $httpProvider.interceptors.push('middleware');
//}]).factory('middleware', function() {
//    return {
//        request: function(config) {
//        	if (config.url.indexOf("http") !== 0) {
//                config.url = "https://example.com/api/" + config.url;
//        	}
//        	return config.url;
//        }
//    };
//});