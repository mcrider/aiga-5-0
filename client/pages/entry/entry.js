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

Template.entry.editingUser = function() {

  return Session.get('editingUser')
}

Template.entry.totalFee = function() {
  if (!Session.get('currentRate')) Session.set('currentRate', 40)
  var numEntries = Entries.find({userId: Meteor.userId(), paid: false}).count();

  return numEntries * Session.get('currentRate');
}

Template.entry.rate_student = function() {
  var lateDate = new Date('10/5/2013');
  var now = new Date();
  if (now.getTime() < lateDate.getTime()) return 30;
  else return 40;
}
Template.entry.rate_member = function() {
  var lateDate = new Date('10/5/2013');
  var now = new Date();
  if (now.getTime() < lateDate.getTime()) return 60;
  else return 70;
}
Template.entry.rate_nonmember = function() {
  var lateDate = new Date('10/5/2013');
  var now = new Date();
  if (now.getTime() < lateDate.getTime()) return 90;
  else return 100;
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

    if($("#aiga_id_pay").length > 0) {
      var currentProfile = Meteor.users.findOne().profile;
      currentProfile.aiga_id = $("#aiga_id_pay").val();
      Meteor.users.update({ _id: Meteor.userId()}, {$set: {profile: currentProfile}});
    }

    var amount = Template.entry.totalFee() * 100;
    var userId = Meteor.userId();
    StripeCheckout.open({
        key: 'pk_test_2hkkBATkmUpbqaxMFJX1aXWQ',
        amount: amount,
        name: 'AIGA 5-0',
        description: 'Entrance fee for the AIGA 5-0 Awards',
        panelLabel: 'Pay Now',
        token: function(res) {
          if(!res.error) {
            Meteor.call('makePayment', res.id, amount, userId);

            // FIXME: This should be called in makePayment but there are weird issues calling meteor methods inside a callback
            Meteor.call('setAsPaid', userId);
            Meteor.call('sendPaymentEmail', Meteor.user().emails[0].address);
          }
        }
    });
  },
  'click .edit-profile': function() {
    Session.set('editingUser', true);
  },
  'click .save-profile': function() {
    Meteor.users.update({ _id: Meteor.userId()}, {$set: {profile: utils.getFormValues('.edit-user-info-form')}});
    Session.set('editingUser', false);
  },
  'click .cancel-save-profile': function() {
    Session.set('editingUser', false);
  }
});

// This important method hooks the template into the CMS
registry.pageTemplate({name: 'entry', label: 'Entry'})
