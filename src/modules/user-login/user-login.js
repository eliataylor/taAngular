import 'angular';

var app = angular.module('user-login', ['sol-backend', 'services'])
.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  editor: 'editor',
  guest: 'guest'
})
.directive('userLogin',
		['$rootScope', '$window', '$timeout', '$http', '$location', 'solBackend', 'AUTH_EVENTS', 'USER_ROLES',
        ($rootScope, $window, $timeout, $http, $location, solBackend, AuthService, AUTH_EVENTS, USER_ROLES) => {
  return {
    restrict: 'E',
    templateUrl: '/modules/user-login/user-login.html',
    replace: true,
    scope: true,
    link: function ($scope, element, attrs) {
	  console.log('userLogin Directive: ', AUTH_EVENTS, $scope.isAuthenticated);
	  	  
	  var cookie = false;
	  var value = "; " + document.cookie;
	  var parts = value.split("; " + 'tacsession' + "=");
	  if (parts.length == 2) cookie = parts.pop().split(";").shift();
	  console.log('cookie', cookie);
	  if (cookie.length > 10) {
		  $http.get('https://localhost.trackauthoritymusic.com/json/getme', { withCredentials: true })
		  .then(function(res) {
			  if (res.data.error) {
				  console.log('tacsession failed', res.data.error);
			  } else if (res.data.user_id) {
				  $scope.setCurrentUser(res.data);
			  }
		  }, 
		    function(response) { // optional
		        console.log('cookie rejected', response);
		  });
	  }
	  // /json/getme > IF VALID set, ELSE reject 
      $scope.toggleGoogleAuth = () => {
          if (!$scope.authenticated)
              solBackend.authenticateWithPopup();
          else
              solBackend.unauthenticate();
      };

      solBackend.getAuth().then(($auth) => {
          $auth.$onAuth((auth) => {
              if (auth && auth.uid) {
                  $scope.authenticated = true;
                  $scope.authData = auth.google;
              }
              else {
                  $scope.authenticated = false;
              }
          });
      });
    }
  };
}])
.factory('AuthService', function ($http, Session) {
  var authService = {};
 
  authService.login = function (credentials) {
	  

	  function serializeParams(obj) {
	    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
	      
	    for(name in obj) {
	      value = obj[name];
	        
	      if(value instanceof Array) {
	        for(i=0; i<value.length; ++i) {
	          subValue = value[i];
	          fullSubName = name + '[' + i + ']';
	          innerObj = {};
	          innerObj[fullSubName] = subValue;
	          query += param(innerObj) + '&';
	        }
	      }
	      else if(value instanceof Object) {
	        for(subName in value) {
	          subValue = value[subName];
	          fullSubName = name + '[' + subName + ']';
	          innerObj = {};
	          innerObj[fullSubName] = subValue;
	          query += param(innerObj) + '&';
	        }
	      }
	      else if(value !== undefined && value !== null)
	        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
	    }
	      
	    return query.length ? query.substr(0, query.length - 1) : query;
	  };
	return $http({
        url: 'https://localhost.trackauthoritymusic.com/manage/users/login?tar=doAjax',
        method: "POST",
        dataType: 'json',
        data: serializeParams(credentials)
//        ,
//        withCredentials: true,
//        headers: {
//            'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
//        }
    })
    .then(function(res) {
	        Session.create(res.data);
	        return res.data;
	    }, 
	    function(response) { // optional
	        console.log(response);
	    });
  };
 
  authService.isAuthenticated = function () {
	console.log('checking isAuthenticated', Session);
    return Session.user_id < 1;
  };
 
  authService.isAuthorized = function (role) {
    console.log('question isAuthorized: ' + role, USER_ROLES);
    return (authService.isAuthenticated() && typeof USER_ROLES[role] == 'object' && USER_ROLES[role] > 2);
  };
  return authService;
})
.factory('AuthResolver', function ($q, $rootScope, $state) {
  return {
    resolve: function () {
      var deferred = $q.defer();
      var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
       	console.log('watching currentUser ', currentUser);
        if (angular.isDefined(currentUser)) {
          if (currentUser) {
        	console.log('currentUser defined');
            deferred.resolve(currentUser);
          } else {
            deferred.reject();
            $state.go('user-login');
          }
          unwatch();
        }
      });
      return deferred.promise;
    }
  };
})
.service('Session', function () {
  this.create = function (me) {
    this.me = me;
    this.user_id = parseInt(me.user_id);
    this.user_status = parseInt(me.user_status);
  };
  this.destroy = function () {
    this.me = null;
    this.user_id = -1;
    this.user_status = 0;
  };
})
.controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
	  console.log('LoginController: ', AUTH_EVENTS);
	  $scope.credentials = {
	    user_email: '',
	    password: ''
	  };
	  $scope.login = function (credentials) {
		console.log('Sending credentials: ', $scope.credentials);
	    AuthService.login(credentials).then(function (user) {
	      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
	      $scope.setCurrentUser(user);
	    }, function () {
	      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
	    });
	  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
	    '$injector',
	    function ($injector) {
	      return $injector.get('AuthInterceptor');
	    }
	  ]);
})
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) { 
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized,
        419: AUTH_EVENTS.sessionTimeout,
        440: AUTH_EVENTS.sessionTimeout
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
.directive('formAutofillFix', function ($timeout) {
  return function ($scope, element, attrs) {
    element.prop('method', 'post');
    if (attrs.ngSubmit) {
      $timeout(function () {
        element
          .unbind('submit')
          .bind('submit', function (event) {
            event.preventDefault();
            element
              .find('input, textarea, select')
              .trigger('input')
              .trigger('change')
              .trigger('keydown');
            $scope.$apply(attrs.ngSubmit);
          });
      });
    }
  };
});

app.run(function ($rootScope, AUTH_EVENTS, AuthService) {
  console.log('RUNNING USER-LOGIN: ', AUTH_EVENTS);
  $rootScope.$on('$stateChangeStart', function (event, next) {
	console.log('state change start', next.data);
    if (!AuthService.isAuthenticated()) {
      event.preventDefault();
	  console.log('NOT AUTHENTICATED: ' + AUTH_EVENTS.notAuthenticated);
      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    }
  });
});


export default app;