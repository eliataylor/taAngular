import './directives/sol-vibrate';
import './directives/sol-slide-rm';
import './directives/sol-scroll2top';
import '../modules/sol-backend/sol-backend';
import './Services';
import 'angular';
import 'angular-ui-sortable';

Date.prototype.getMonthStr = function() {
    if (this.getMonth()==0)return "Jan";
    if (this.getMonth()==1)return "Feb";
    if (this.getMonth()==2)return "Mar";
    if (this.getMonth()==3)return "Apr";
    if (this.getMonth()==4)return "May";
    if (this.getMonth()==5)return "Jun";
    if (this.getMonth()==6)return "Jul";
    if (this.getMonth()==7)return "Aug";
    if (this.getMonth()==8)return "Sept";
    if (this.getMonth()==9)return "Oct";
    if (this.getMonth()==10)return "Nov";
    if (this.getMonth()==11)return "Dec";
};
Date.prototype.getDayStr = function() {
    if (this.getDay()==0)return "Sun";
    if (this.getDay()==1)return "Mon";
    if (this.getDay()==2)return "Tue";
    if (this.getDay()==3)return "Wed";
    if (this.getDay()==4)return "Thur";
    if (this.getDay()==5)return "Fri";
    if (this.getDay()==6)return "Sat";
};

function mouseCoords(event) {
    var totalOffsetX = 0,
        totalOffsetY = 0,
        canvasX = 0,
        canvasY = 0,
        currentElement = event.target;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        currentElement = currentElement.offsetParent;
    }
    while (currentElement);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {
        x: canvasX,
        y: canvasY
    };
}

export default angular.module('ui.playlist',
    ['sol-backend', 'services', 'filters', 'ui.sortable', 'solVibrate', 'solSlideRm', 'solScroll2top'])
    .directive('playlistPane', [
            '$rootScope', '$window', '$timeout', '$http', '$location', 'youtubeAPI', 'taAPI', 'playList', 'solBackend', 'lastfm',
            function($rootScope, $window, $timeout, $http, $location, youtubeAPI, taAPI, playList, solBackend, lastfm) {
        var definitions = {
            restrict: 'E',
            templateUrl: '/html/playlist/pane.html',
            replace: true,
            scope: true,
            link: function($scope, $element, $attrs) {
                var media = window.matchMedia('(max-width:1280px),(max-device-width:1280px)');
                
                $scope.duration = 0;
                $scope.progress = 0;

                if (media.matches) {
                    $scope.ready = true;
                } else {
                    $rootScope.$on('searchPane:loaded', function() {
                        $scope.ready = true;
                        if (!$scope.$$phase) $scope.$digest();
                    });
                }

                solBackend.onAuth((authData) => {
                    $scope.authData = authData;
                });
                
                taAPI.getChallenges().then(function(response) {
                	if (typeof response.error != 'undefined') {
                        $rootScope.$broadcast('app::confirm', {
                            title: 'Login',
                            confirmOnly: false,
                            onConfirm: () => {
                                $window.location.href='https://trackauthoritymusic.com';
                            },
                            html: `<a href="https://trackauthoritymusic.com" target="_blank">Login</a> to access Challenge playlists`
                        });
	                } else if (typeof response.popBody == 'object') {
	                    $scope.challenges = response.popBody; // updates select
	                	var q = $scope.$$prevSibling.query;
	                    $timeout(()=>{
	                    	for(var i in $scope.challenges) {
	                    		if (q === $scope.challenges[i].challenge_title ||
	                    		    (q.length < 1  && parseInt($scope.challenges[i].challenge_id) > 0)) {
	                            	$scope.selectedChallengeItem = $scope.challenges[i];
	                            	$scope.getTAplaylist();
	                            	return false;
	                            }                        		
	                    	}
	                    });
	                }
                });

                $scope.publishPlaylist = () => {
                    playList.publishPlaylist().then((refKey) => {
                    	console.log('Playlist.js: publishPlaylist');
                        let url = `${window.location.origin}/#playlist=${refKey}`;
                        $rootScope.$broadcast('app::confirm', {
                            title: 'Share URL',
                            confirmOnly: true,
                            html: `A link to this playlist has been created:
                                    <br/>
                                    <a href="${url}" target="_blank">${url}</a>`
                        });
                    });
                };

                $scope.$watch(() => playList.isShuffled(), (newVal) => {
                    $scope.shuffled = newVal;
                });
                
                $scope.toggleShuffle = () => {
                    playList.toggleShuffle();
                };

                $scope.clearPlaylist = function() {
                    $rootScope.$broadcast('app::confirm', {
                        title: 'Clear Playlist',
                        text: 'You are about to clear your entire playlist. Are you sure?',
                        onConfirm: () => {
                            playList.clearList();
                            $location.search('playlist', null);
                        }
                    });
                };

                $scope.isItemActive = (idx) => {
                    let state = playList.getState();
                    let playing = state === playList.st.PLAYING;
                    let active = playing && $scope.getItemProgress(idx) > 0;
                    return active || undefined;
                };

                $scope.getItemProgress = (idx) => {
                    let progress = $scope.progress;

                    if ($scope.nowPlayingIdx === idx)
                        return progress;
                };

                $scope.itemMatch = function(item, query) {
                    var matches;
                    if (!query) return true;

                    matches = item.snippet
                        .title.toLowerCase()
                        .indexOf(query.toLowerCase()) >= 0;

                    return matches || undefined;
                };

                $scope.$on('actions-toggled', (e, value) => {
                    if (value === true) {
                        let target = e.targetScope;
                        let idx = target.idx;

                        $scope.items.forEach((item, i) => {
                            if (i === idx) return;
                            item.actionsOpen = false;
                        });
                    }
                });

                let backgroundSet = false;

                Object.assign($scope, {
                    getCurrentlyOpenIdx: () => {
                        let idx = null;

                        $scope.items.some((item, i) => {
                            if (item.actionsOpen) {
                                idx = i;
                                return true;
                            }
                        });

                        return idx;
                    },
                    uploadPlaylist () {
                        solBackend.savePlaylist(
                            this.metadata, this.items);
                    },                       
                    getTAplaylist () {
                    	$scope.cid = parseInt($scope.selectedChallengeItem.challenge_id);
                    	$scope.$$prevSibling.query = $scope.$$prevSibling.query = $scope.selectedChallengeItem.challenge_title;
                    	if ($scope.cid > 0) {
                    		playList.clearList();
                            $location.search('playlist', null);
	                    	taAPI.getTAplaylist($scope.cid).then(function(challenge){	                    		
	                    		$scope.challenge = challenge;
	                        	document.getElementById('challengeBlock').style.display = "block";
	                        	angular.forEach(challenge.tracks, function(track, key) {
	                                    this.playlist.splice(this.playlist.length, 0, this.formatItem(track));
	                        		}, playList);
                    			playList.saveList();
	                    	});
                    	} else {
                        	document.getElementById('challengeBlock').style.display = "none";                    		
                    	}
                    },
                    changeBackground () {
                        let nowPlayingIdx = playList.getNowPlayingIdx();
                        let nowPlaying = playList.getNowPlaying();
                        backgroundSet = false;

                        if (nowPlaying) {
                            lastfm.getTrackImage(
                                nowPlaying.snippet.title
                            ).then(src => {
                                if (!backgroundSet) {
                                    $scope.backgroundImg = src;
                                    backgroundSet = true;
                                }
                            });
                        }
                        else $scope.backgroundImg = '';
                    }
                });

                $scope.$watch(playList.getNowPlayingIdx,
                    val => {
                        $scope.nowPlayingIdx = val;
                        $scope.progress = 0;
                        $scope.changeBackground();
                    });

                $scope.$watch(playList.getDuration,
                    val => $scope.duration = val);

                $scope.$watch(playList.getProgress,
                    val => $scope.progress = val);
                
                $scope.sortableOpts = {
                    axis: 'y',
                    handle: '.mover',
                    start: function(e, ui) {
                    	console.log('Playlist.js: sortableOpts start');                    	
                        $rootScope.$broadcast('closeTrackActions');
                        $scope.currentlyDragging = true;
                        if (!$scope.$$phase) $scope.$digest();
                    },
                    stop: function(e, ui) {
                    	console.log('Playlist.js: sortableOpts stop');                    	
                        // Fix the playlist's currently playing track
                        var fromIdx = ui.item.sortable.index,
                            toIdx = ui.item.sortable.dropindex,
                            nowPlaying = playList.getNowPlayingIdx();

                        if (typeof nowPlaying === 'number') {
                            if (fromIdx < nowPlaying &&
                                toIdx >= nowPlaying) {
                                playList.setNowPlaying(nowPlaying - 1);
                            } else if (fromIdx > nowPlaying &&
                                toIdx <= nowPlaying) {
                                playList.setNowPlaying(nowPlaying + 1);
                            } else if (fromIdx === nowPlaying) {
                                playList.setNowPlaying(toIdx);
                            }
                        }

                        playList.save();
                        $scope.currentlyDragging = false;
                        if (!$scope.$$phase) $scope.$digest();
                    }
                };
            },
            controller: function($scope, $element, $attrs, $transclude) {
                $scope.challenges = null;
                $scope.challenge = null;
                $scope.selectedChallengeItem=null;
                $scope.cid = null;
                $scope.items = playList.playlist;
                $scope.$watch(() => playList.metadata, (newVal, oldVal) => {
                    if (!!newVal) {
                        newVal.$bindTo($scope, "metadata");
                    }
                    else {
                        $scope.metadata = null;
                    }

                    if (oldVal) {
                        oldVal.$destroy();
                    }
                });
                
                $scope.savePlaylist = function() {
                	console.log('Playlist.js: savingPlaylist');
                    playList.save();
                };
                
                $scope.fDate = function(str, f){
                    if (typeof str == "string" && str != "") str = parseInt(str);
                    var d = new Date(str * 1000);
                    return d.getDayStr() + ". " + d.getMonthStr() + " " + d.getDate() + ", " + d.getFullYear();            
                },
                $scope.getUserName  = function(uid, users) {
                	for(var i in users){
                		if (users[i].user_id == uid) {
                			return users[i].user_screenname;
                		}
                	}
                	return 'anonymous';
                };   
                $scope.getUserPic = function(uid, users) {
                	var user = false, path = false;
                	for(var i in users){
                		if (users[i].user_id == uid) {
                			user = users[i];
                			break;
                		}
                	}
                	if (!user) return path;
                    if (typeof user['group_user_headshot'] == 'string') {
                        return user['group_user_headshot'];
                    } else if (typeof user['user_headshot'] == 'string') {
                        return user['user_headshot'];            
                    }
                    return path;
                }
            }
        };

        return definitions;
    }]).directive('playlistProgress', ['$rootScope', 'youtubePlayer', function($rootScope, youtubePlayer) {
        var definitions = {
            restrict: 'E',
            templateUrl: '/html/playlist/progress.html',
            replace: true,
            scope: {
                progress: '=',
                duration: '@'
            },
            link: function($scope, $element, $attrs) {
                $element.on('click', function(e) {
                    var coords, time;
                    if (e.target.classList.contains('progress')) {
                        coords = mouseCoords(e);
                        time = $scope.duration * (coords.x / e.target.clientWidth);

                        youtubePlayer.seek(time);
                    }
                });
            }
        };

        return definitions;
    }]).directive('challengeBlock', function ($compile) {
        var definitions = {
                restrict: 'E',
                templateUrl: '/html/playlist/challengeBlock.html',
                replace: true,
                scope: true,
                transclude:true,
                link: function($scope, $element, $attrs) {
                    $compile($element.contents())(scope);
                }
            };
            return definitions;
        });
