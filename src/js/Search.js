import './directives/sol-scroll2top';
import './Services';
import './Filters';
import 'angular';
export default angular.module('ui.search', ['services', 'filters', 'solScroll2top'])
    .directive('searchPane', ['$timeout', 'youtubeAPI', 'lastfm', function($timeout, youtubeAPI, lastfm) {
        return {
            restrict: 'E',
            templateUrl: '/html/search/pane.html',
            replace: true,
            scope: true,
            link: function($scope, $element, $attrs, $transclude) {
                let lastSearch = null;

                $scope.query = '';
                $scope.search = (value) => {
                    if (lastSearch)
                        clearTimeout(lastSearch);

                    lastSearch = setTimeout(() => {
                        $scope.searching = true;
                        $scope.albums = [];

                        youtubeAPI.search($scope.query).then(function(items) {
                            $scope.$emit('items-fetched', items);
                            $scope.items = items;
                            $scope.searching = false;

                            lastfm.albumSearch($scope.query).then(albums => {
                                return $timeout(() => {
                                    $scope.albums = albums;
                                });
                            });
                        });
                    }, 600);

                    localStorage.latestSearch = value;
                };

                $scope.$watch('query', $scope.search);

                if (localStorage.latestSearch) {
                    $scope.query = localStorage.latestSearch;
                }
            }
        };
    }]).directive('searchResultAlbums', ['$rootScope', 'youtubeAPI', 'playList', 'lastfm', ($rootScope, youtubeAPI, playList, lastfm) => {
        return {
            restrict: 'E',
            templateUrl: '/html/search/albums-list.html',
            replace: true,
            scope: {
                albums: '='
            },
            link: function($scope, $element, $attrs, $transclude) {
                $scope.active = true;
                $scope.addAlbum = (album) => {
                    Promise.all(album.tracks.track.map(track => {
                        let title = track.name.replace(
                            /\([^(]*(version|remaster(ed)?|remix).*?\)/i, '');
                        let artist = album.artist;
                        let videoDuration = track.duration < 260 ?
                            'short' : (track.duration < 1200 ?
                                'medium' : 'long');

                        return youtubeAPI.search({
                            q: `${artist} ${title}`,
                            maxResults: 1,
                            videoDuration
                        }).then(items => items[0]);
                    })).then(results => {
                        return playList.addBulk(results);
                    }).then(() => {
                        $rootScope.$broadcast('added_full_album', album);
                        $rootScope.$broadcast('toast::notify', {
                            text: `Album "${album.name}" has been added to the playlist`
                        });
                    });
                };
            }
        };
    }]).directive('searchResultList', [() => {
        return {
            restrict: 'E',
            templateUrl: '/html/search/result-list.html',
            replace: true,
            scope: {
                items: '='
            }
        };
    }]).directive('searchResultItem', ['$rootScope', '$http', 'playList', function($rootScope, $http, playList) {
        return {
            restrict: 'E',
            templateUrl: '/html/search/result.html',
            replace: true,
            scope: {
                videoId: '@videoId',
                title: '@title',
                description: '@description',
                thumbnail: '@thumbnail',
                duration: '@duration'
            },
            controller: function($scope, $element, $attrs, $transclude) {
                $scope.emitAddLast = function() {
                    playList.addLast($scope.videoId);
                };
            }
        };
    }]);
