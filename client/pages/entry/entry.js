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

Template.entry.notEditingUser = function() {
  return Session.get('notEditingUser')
}

Template.entry.totalFee = function() {
  if (!Session.get('currentRate')) Session.set('currentRate', 40)
  var numEntries = Entries.find({userId: Meteor.userId(), paid: false}).count();

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
  },
  'click .payup-sucka': function(e) {
    e.preventDefault();

    var amount = Template.entry.totalFee() * 100;
    var userId = Meteor.userId();
    StripeCheckout.open({
        key: 'pk_test_6Tuzfip0q53BIzRSCHhaeuUU',
        amount: amount,
        name: 'AIGA 5-0',
        description: 'Entrance fee for the AIGA 5-0 Awards',
        panelLabel: 'Pay Now',
        token: function(res) {
          if(!res.error) {
            Meteor.call('makePayment', res.id, amount, userId);

            // FIXME: This should be called in makePayment but there are weird issues calling meteor methods inside a callback
            Meteor.call('setAsPaid', userId);
          }
        }
    });
  },
  'click .edit-profile': function() {
    Session.set('notEditingUser', false);
  },
  'click .save-profile': function() {
    Meteor.users.update({ _id: Meteor.userId()}, {$set: {profile: utils.getFormValues('.edit-user-info-form')}});
    Session.set('notEditingUser', true);
  },
  'click .cancel-save-profile': function() {
    Session.set('notEditingUser', true);
  }
});

// This important method hooks the template into the CMS
registry.pageTemplate({name: 'entry', label: 'Entry'})
