
Template.admin_entry_list.entries = function() {
  return Entries.find({userId: Session.get('adminUserId')});
}

Template.admin_entry_list.user = function() {
  var user = Meteor.users.findOne(Session.get('adminUserId'));
  if (user && user.profile && user.profile.contact_name) return user.profile.contact_name;
  else if (user && user.emails[0].address) return user.emails[0].address;
  else return '';
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
      $container.find('.edit-entry-form').fadeOut(200, function(){
        $container.find('.entry-info').fadeIn(200);
      });
    } else {
      $(e.currentTarget).text('Cancel').addClass('editing');
      var $container = $(e.currentTarget).parent().parent();
      $container.find('.entry-info').fadeOut(200, function(){
        $container.find('.edit-entry-form').fadeIn(200);
      });
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
  }
});
