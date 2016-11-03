import 'angular';

export default angular.module('Application', [])
.factory('User', function (Organisation) {
  
  /**
   * Constructor, with class name
   */
  function User(user_id, cur_group, ...args) {
    // Public properties, assigned to the instance ('this')
    this.user_id = user_id;
    this.cur_group = cur_group;
    this.data = args;
  }
 
  /**
   * Public method, assigned to prototype
   */
  User.prototype.getName = function () {
    return this.user_screenname;
  };
 
  /**
   * Private property
   */
  var possibleRoles = ['admin', 'editor', 'guest'];
 
  /**
   * Private function
   */
  function checkRole(role) {
    return possibleRoles.indexOf(role) !== -1;
  }
 
  /**
   * Static property
   * Using copy to prevent modifications to private property
   */
  User.possibleRoles = angular.copy(possibleRoles);
 
  /**
   * Static method, assigned to class
   * Instance ('this') is not available in static context
   */
  User.build = function (data) {
    if (!checkRole(data.user_status)) {
      return;
    }
    return new User(
      Organisation.build(data) // another model
    );
  };
 
  /**
   * Return the constructor function
   */
  return User;
});