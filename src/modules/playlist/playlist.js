import 'angular';
import '../../js/dataobjects/Track';
// import playlistItem from './item/item.js';
import Filters from '../../js/Filters';

export default angular.module('playlist', [])
//    .directive('playlistItem', playlistItem);
	.directive('playlistItem',
	['$rootScope', '$http', 'playList', 
	    function($rootScope, $http, playList) {
	    var definitions = {
	        restrict: 'E',
	        templateUrl: '/modules/playlist/item/item.html',
	        replace: true,
	        scope: {
	            'title': '@',
	            'duration': '@',
	            'progress': '@',
	            'active': '@',
	            'actionsOpen': '=?',
	            'playNext': '@',
	            'stopHere': '@',
	            'repeat': '@',
	            'index': '@index'
	        },
	        link: function($scope, $element, $attrs, $transclude) {
	        	$scope.challenge = null;
	        	//console.log(Track);
	            Object.assign($scope, {
	                get idx () {
	                    return parseInt($scope.index, 10);
	                },
	                isPlaying: () => {
	                    let progress = parseInt($scope.progress, 10);
	                    return progress > 0;
	                },
	                actions: {
	                    toggle: () => {
	                        if ($scope.isPlaying())
	                            playList.togglePlay();
	                        else
	                            playList.play(parseInt($scope.index, 10));
	                    },
	                    playNext: () => {
	                        if ($scope.playNext)
	                            playList.playNext(null);
	                        else
	                            playList.playNext($scope.idx);
	                    },
	                    stopHere: () => {
	                        if ($scope.stopHere)
	                            playList.stopAt(null);
	                        else
	                            playList.stopAt($scope.idx);
	                    },
	                    repeat: () => {
	                        if ($scope.repeat)
	                            playList.repeatTrack(null);
	                        else
	                            playList.repeatTrack($scope.idx);
	                    },
	                    remove: () => {
	                        playList.remove($scope.idx);
	                    },
	                    submitToTa: () => {
	                        console.log('send to ta', $scope.idx);
	                    }
	                }
	            });

	            $scope.$watch('actionsOpen', (newVal) => {
	                $scope.$emit('actions-toggled', newVal);
	            });
	        }
	    };

	    return definitions;
	}]);

