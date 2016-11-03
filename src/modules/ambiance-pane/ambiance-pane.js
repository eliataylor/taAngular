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
        	console.log("AMBIANCE LINKED", playList.playlist);
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
        	
        	var cid = playList.getNowPlayingIdx();
        	var state = playList.getState();
        	
        	/*
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
            */
        	
        	console.log("AMBIANCE CONTROLLER", cid, state);
            $scope.challenges = [];
            $scope.challenge = null;
            $scope.selectedChallengeItem=null;
            $scope.cid = null;
            $scope.items = playList.playlist;
//            $scope.$watch(() => playList.metadata, (newVal, oldVal) => {
//                if (!!newVal) {
//                    newVal.$bindTo($scope, "metadata");
//                } else {
//                    $scope.metadata = null;
//                }
//
//                if (oldVal) {
//                    oldVal.$destroy();
//                }
//            });
            
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
                
            }
        };
        return definitions;
    });