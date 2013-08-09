// Accompanying JS file for the page template.
// Describes the page's metadata and actions.

Template.entry.label = 'Entry';
Template.entry.description = 'Entry management page';

Template.entry.currentUser = function() {
  var user = Meteor.user();
  if (!user) return false;

  var displayName = '';
  if(user.username) displayName = user.username;
  else if (user.emails && user.emails[0] && user.emails[0].address) displayName = user.emails[0].address;

  var profile = user.profile || {};
  profile.displayName = displayName;

  return profile;
}

Template.entry.currentlyEntering = function() {
  return Session.get('newEntry');
}

Template.entry.totalFee = function() {
  if (!Session.get('currentRate')) Session.set('currentRate', 40)
  var numEntries = Entries.find().count();

  return numEntries * Session.get('currentRate');
}

// shared between dropdown and single mode
Template.entry.events({
  'click #login-buttons-logout': function() {
    Meteor.logout(function () {
      loginButtonsSession.closeDropdown();
    });
  },
  'change #rate': function(e) {
    var rate = $(e.currentTarget).val();
    Session.set('currentRate', rate);
  }
});

// This important method hooks the template into the CMS
registry.pageTemplate({name: 'entry', label: 'Entry'})
