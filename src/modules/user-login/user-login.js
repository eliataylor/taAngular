import 'angular';

var app = angular.module('user-login', 
		['sol-backend', 'services'])
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
      var showDialog = function () {
        $scope.visible = true;
      };
            
	  console.log('loginForm Directive: ', AUTH_EVENTS);
	  
	  var cookie = false;
	  var value = "; " + document.cookie;
	  var parts = value.split("; " + 'tacsession' + "=");
	  if (parts.length == 2) cookie = parts.pop().split(";").shift();
	  console.log('cookie', cookie);
	  
	  // /json/getme > IF VALID set, ELSE reject 
	  // google-signing
	  
      $scope.visible = false;
      $scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
      $scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
            
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
    return $http
      .post('https://localhost.trackauthoritymusic.com/manage/users/login?tar=doAjax', credentials)
      .then(function (res) {
        Session.create(res.data);
        return res.data;
      });
  };
 
  authService.isAuthenticated = function () {
    return Session.user_id < 1;
  };
 
  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.user_status) > 2);
  };
 
  return authService;
})
.factory('AuthResolver', function ($q, $rootScope, $state) {
  return {
    resolve: function () {
      var deferred = $q.defer();
      var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
        if (angular.isDefined(currentUser)) {
          if (currentUser) {
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
		console.log('sending credentials: ', $scope.credentials);
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
	  console.log(' RUNNING USER-LOGIN: ', AUTH_EVENTS);
	  $rootScope.$on('$stateChangeStart', function (event, next) {
	    var authorizedRoles = next.data.authorizedRoles;
	    if (!AuthService.isAuthorized(authorizedRoles)) {
	      event.preventDefault();
	      if (AuthService.isAuthenticated()) {
	        // user is not allowed
	      	console.log('NOT AUTHORIZED: ' + AUTH_EVENTS.notAuthenticated);
	        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
	      } else {
	        // user is not logged in
	    	console.log('NOT AUTHENTICATED: ' + AUTH_EVENTS.notAuthenticated);
	        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
	      }
	    }
	  });
	});


export default app;