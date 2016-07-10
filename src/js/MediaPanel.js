import './directives/sol-vibrate';
import './Services';
import 'angular';
export default angular.module('ui.media-panel', ['solVibrate'])
    .directive('mediaPanel', ['$rootScope', 'playList', function($rootScope, playList) {
        var definitions = {
            restrict: 'E',
            templateUrl: '/html/media-panel/panel.html',
            replace: true,
            scope: true,
            controller: function($scope, $element, $attrs, $transclude) {
                $scope.setIsCued = function(val) {
                    val = typeof val === 'boolean' ? val : true;
                    $scope.isCued = val;
                };
                
                $scope.getAudioUrl = function() {
                	return $sce.trustAsResourceUrl('your url');
                	};
                	
                $scope.toggleVideo = function() {
                    $element.toggleClass('show-video');
                };
                $scope.$watch(playList.getNowPlaying, function(newVal, oldVal) {
                    if (newVal)
                        $element.addClass('active');
                });

                $scope.$on('youtubePlayer:videoCued', function(e, data) {
                    $rootScope.$broadcast('toast::notify', {
                        text: 'The video should be played manually',
                        persist: true
                    });

                    let unregister = $scope.$on('youtubePlayer:onStateChange', function(e, data) {
                        if (data.info === YT.PlayerState.PLAYING) {
                            $rootScope.$broadcast('toast::close');
                            unregister();
                        }
                    });
                });
            }
        };

        return definitions;
    }])
    .directive('mediaPlayer', ['$sce', 'youtubePlayer', 'playList', function($sce, ytPlayer, playList) {
        var definitions = {
            restrict: 'E',
            templateUrl: '/html/media-panel/youtube.html',
            replace: true,
            scope: true,
            link: function($scope, $element) {
            	$scope.audioSrc = ''; 
                ytPlayer.setElement($element.attr('id'));
            },
            controller: function($scope, $element, $attrs, $transclude) {
                $scope.nowPlaying = ytPlayer.nowPlaying;
            }
        };

        return definitions;
    }]).directive('playlistRelated', ['$rootScope', 'youtubePlayer', 'youtubeAPI', 'taAPI', 'playList', 
                                      function($rootScope, youtubePlayer, youtubeAPI, taAPI, playList) {
        var definitions = {
            restrict: 'E',
            templateUrl: '/html/media-panel/related.html',
            replace: true,
            scope: {},
            controller: function($scope, $element, $attrs, $transclude) {
                $scope.addItem = function(videoId) {
                    playList.addLast(videoId);
                };
                $scope.$watch(() => {
                    let nowPlaying = playList.getNowPlaying();
                    if (!nowPlaying) return null;
                    return nowPlaying.id;
                }, function(videoId) {
                    if (videoId && videoId.indexOf("ta_") == 0) {
                    	// getNext challenge?
                    } else if (videoId) {
                        youtubeAPI.getRelated(videoId).then(function(items) {
                            $scope.items = items;
                        });
                    }
                });
            }
        };
        return definitions;
    }]);
