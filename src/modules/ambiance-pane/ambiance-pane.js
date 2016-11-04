import 'angular';

export default angular.module('ambiance-pane', 
	    ['sol-backend', 'services', 'filters'])
	    .directive('ambiancePane',
            ['$rootScope', '$window', '$timeout', '$http', '$location', 'youtubeAPI', 'taAPI', 'playList', 'solBackend',
            ($rootScope, $window, $timeout, $http, $location, youtubeAPI, taAPI, playList, solBackend) => {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/modules/ambiance-pane/ambiance-pane.html',
        scope: {},
        link: ($scope, $element) => {
        	console.log("AMBIANCE LINKED playList.playlist", playList.playlist, $scope.isAuthenticated);
            Object.assign($scope, {
                challenge_id:null,
                active: false,
                status: 'active',
                users_count:0,
                track_scount:0,
                challenge_id:-1,
                track_list:[],
                track_order:{},
                author_id:-1,
                ta_id:-1
            });
        }, 
        controller: function($scope, $element, $attrs) {
        	$scope.challenges = [{challenge_id:-1,challenge_title:"My custom playlist",group_id:-1}];
            $scope.challenge = null;
            $scope.selectedChallengeItem = [0];
        	$scope.currentUser = false;
        	$scope.isAuthenticated = false;
        	
        	var cid = playList.getNowPlayingIdx();
        	var state = playList.getState();
        	
        	console.log('ambiance-pane knows isAuthenticated', $scope.isAuthenticated);
        	if (true || $scope.isAuthenticated) {

                taAPI.getChallenges().then(function(response) {
                	if (typeof response.popBody == 'object') {
                		console.log('ALL CHALLENGES: ', response);
                        var options = response.popBody;
                        options['_-1'] = {challenge_id:-1,challenge_title:"My custom playlist",group_id:-1};
                		$scope.challenges = options;
                        
                        for(var i in response.popBody) {
                            $scope.selectedChallengeItem = response.popBody[i];
                        	break;
                        }
                        
                        /* check if a song is already queued
                    	var q = $scope.$$prevSibling.query;
                    	for(var i in $scope.challenges) {
                    		if (q === $scope.challenges[i].challenge_title ||
                    		    (q.length < 1  && parseInt($scope.challenges[i].challenge_id) > 0)) {
                            	//$scope.selectedChallengeItem = $scope.challenges[i];
                            	//$scope.getTAplaylist();
                            	return false;
                            }                        		
                    	}
                    	*/
                                            	
                    	if ($scope.selectedChallengeItem.challenge_id > 0) {
                    		var cid = $scope.selectedChallengeItem.challenge_id;
                    		taAPI.getTAplaylist(cid).then(function(response) {
                        		console.log('GOT CHALLENGE: ', response);
                        		$scope.challenge = response.popBody;
                            });
                    	}
                    	
                    }
                });
        	}

            $scope.items = playList.playlist;
            $scope.$watch(() => playList.metadata, (newVal, oldVal) => {
                if (!!newVal) {
                    newVal.$bindTo($scope, "metadata");
                } else {
                    $scope.metadata = null;
                }

                if (oldVal) {
                    oldVal.$destroy();
                }
            });
            
            $scope.getChallenge = function(){
            	return $scope.challenge;
            }               
        }
    }
}])
.directive('challengeBlock', function ($compile) {
    var definitions = {
            restrict: 'E',
            templateUrl: '/html/playlist/challengeBlock.html',
            replace: true,
            scope: true,
            transclude:true,
            link: function($scope, $element, $attrs) {
    	        $scope.dataSources = {
		        	ci: 'https://localhost.trackauthoritymusic.com',
		        	angular: 'https://localplayer.trackauthoritymusic.com',
		        	api : 'https://localhost.trackauthoritymusic.com'
		        }
            }
        };
        return definitions;
    });