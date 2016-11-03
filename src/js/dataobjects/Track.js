import 'angular';

/*
 * Song abstraction for tracks from different sources: youtube, mp3, ...
 */
export default angular.module('track', [])
.factory('trackItem', 
		['$http', 'youtubeAPI', 'taAPI', 'playList', 'solBackend', 'lastfm',
        function($http, youtubeAPI, taAPI, playList, solBackend, lastfm) {
    var KEYS = {
            isplaying,
            preload,
            duration,
            meta,
            user_id,
            challege_id
      };
    
    function Track(tid, yid, ...args) {
        this.track_id = tid;
        this.track_youtube = yid;
        Object.assign(this, args);
        Object.assign(this, props);
        // TODO: deconstruct keys explicitly
      }

	return Track;
    
}]);