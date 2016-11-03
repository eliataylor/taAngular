var taBasePath = 'https://localhost.trackauthoritymusic.com',
	basePath = 'https://www.googleapis.com/youtube/v3', 
    maxResults = 50;

export default ['$rootScope', '$http', '$q', function($rootScope, $http, $q) {
    var APIKEY = null;
    $rootScope.$on('youtube-apikey', function(e, key) {
        APIKEY = key;
    });
    
    this.getChallenges = function(gid) {    	
        return $http.get(taBasePath + '/json/challenges').then(function(list) {
        	if (typeof list.data.error == 'string') {
        		console.log(list.data.error);
        	} 
            return list.data;
        });    	
    }
    
    this.getUser = function(uid) {
        return $http.get(taBasePath + '/json/users/profile?uid=' + uid).then(function(list) {
        	if (typeof list.errors == 'string') {
        		console.log(list.data.errors);
        	} else {
        		// populate playlist!!
                console.log(list.data.popBody);
        	}
    		return list.data.popBody;
        });    
    }
    
    this.getTAplaylist = function(cid) {
    	var that = this;
        var path = taBasePath + '/json/playlist?cid=' + cid;  

        return $http.get(path).then(function(list) {
        	if (typeof list.errors == 'string') {
        		console.log(list.data.errors);
        	} else {
        		// populate playlist!!
                console.log(list.data.popBody);
        	}
    		return list.data.popBody;
        });        	
    }
    
    
}];

