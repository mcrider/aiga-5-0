Template.admin_users.users = function() {
  return Meteor.users.find();
};

Template.admin_users.entryCount = function() {
  var userId = this._id;
  return Entries.find({userId: userId}).count();
}

Template.admin_users.events = {
  'click .admin': function() {
    if(!this._id) return false;
    if(Meteor.userId() == this._id) return false; // Can't un-admin yourself
    if(_.contains(this.roles, "admin")) Roles.removeUsersFromRoles([this._id], ['admin']);
    else Roles.addUsersToRoles([this._id], ['admin']);
  },
  'click .author': function() {
    if(!this._id) return false;
    if(_.contains(this.roles, "author")) Roles.removeUsersFromRoles([this._id], ['author']);
    else Roles.addUsersToRoles([this._id], ['author']);
  },
  'click .delete-user': function (e) {
    e.preventDefault();
    Session.set('delete-user-id', this._id);
    $('#deleteUserModal').modal('show');
  },
  'click .delete-user-confirm': function(e) {
    e.preventDefault();
    $('#deleteUserModal').modal('hide');
    var userId = Session.get('delete-user-id')
    if(!userId) return false;

    if(Meteor.userId() == userId) return false; // Can't delete yourself

    Roles.removeUsersFromRoles([userId], ['admin']);
    Roles.removeUsersFromRoles([userId], ['author']);
    Meteor.users.remove(userId);
  },
  'click .numberCircle': function(e) {
    Session.set('adminUserId', this._id);
  }
};

// Renders the header template (delaying load until site settings are available)
Template.admin_users.helpers({
  renderSidebar: function (block) {
    if (Session.get('adminUserId')) {
      var fragment = Template['admin_entry_list'](); // this calls the template and returns the HTML.
      return fragment;
    } else {
      return '';
    }
  }
});