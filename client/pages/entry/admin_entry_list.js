
Template.admin_entry_list.entries = function() {
  return Entries.find({userId: Session.get('adminUserId')});
}

Template.admin_entry_list.user_label = function() {
  var user = Meteor.users.findOne(Session.get('adminUserId'));
  if (user && user.profile && user.profile.contact_name) return user.profile.contact_name;
  else if (user && user.emails[0].address) return user.emails[0].address;
  else return '';
}

Template.admin_entry_list.user = function() {
  var user = Meteor.users.findOne(Session.get('adminUserId'));
  if (user && user.profile) return user;
  else return null;
}

Template.admin_entry_list.events({
  'click #newEntry': function(e) {
    Session.set('entry-files', null);
    e.preventDefault();
    Session.set('newEntry', true)
  },
  'click .edit-project': function(e) {
    e.preventDefault();

    if($(e.currentTarget).hasClass('editing')) {
      $(e.currentTarget).text('Edit').removeClass('editing');
      var $container = $(e.currentTarget).parent().parent();
      $container.find('.admin-edit-entry').addClass('hidden');
      $container.find('.entry-info').removeClass('hidden');
    } else {
      $(e.currentTarget).text('Cancel').addClass('editing');
      var $container = $(e.currentTarget).parent().parent();
      $container.find('.entry-info').addClass('hidden');
      $container.find('.admin-edit-entry').removeClass('hidden')
    }

  },
  'click .remove-project': function(e) {
    e.preventDefault();
    $('#deleteEntryModal').modal('show');
    Session.set('currentEntry', this._id);
  },
  'click .delete-entry': function(e) {
    $('#deleteEntryModal').modal('hide');
    Entries.remove(Session.get('currentEntry'));
  },
  'click .show-entry-info': function(e) {
    e.preventDefault();
    $entryOverviewContainer = $(e.currentTarget).parent().next('.entry-overview-container');
    if($entryOverviewContainer.is(':visible')) {
      $entryOverviewContainer.hide();
      $(this).find('i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
    } else {
      $entryOverviewContainer.show();
      $(this).find('i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
    }

  }
});


Template.admin_entry_list.typeEquals = function (typeOne, typeTwo) {
  return typeOne === typeTwo;
};

Template.admin_entry_list.typeNotEquals = function (typeOne, typeTwo) {
  return typeOne !== typeTwo;
};
