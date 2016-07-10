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
import '../modules/user-playlists/user-playlists';
import '../modules/google-signin/google-signin';
import '../modules/peer-pane/peer-pane';
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
    'playlist',
    'services',
    'plugins'
]).directive('solarizdApp', ['$rootScope', 'ApiKey', 'playList', function($rootScope, ApiKey, playList) {
    return {
        restrict: 'E',
        templateUrl: '/html/app.html',
        replace: true,
        scope: true,
        link: function($scope, $element) {
            $scope.dataSources = {
            		assets: 'https://localhost.fantasytrackballs.com',
            		angular: 'https://localplayer.fantasytrackballs.com',
            		api : 'https://localhost.fantasytrackballs.com'
            };
            
            if (playList.playlist.length) {
                $scope.defaultTab = 1;
            } else {
                $scope.defaultTab = 0;
            }

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
	        		assets: 'https://localhost.fantasytrackballs.com',
	        		angular: 'https://localplayer.fantasytrackballs.com',
	        		api : 'https://localhost.fantasytrackballs.com'
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
//        	if (config.url.indexOf("/html") !== 0) {
//                config.url = "https://example.com/api/" + config.url;
//        	}
//        	return config.url;
//        }
//    };
//});
;