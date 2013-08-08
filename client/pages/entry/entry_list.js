
Template.entry_list.entries = function() {
  return Entries.find();
}

Template.entry_list.events({
  'click #newEntry': function(e) {
    e.preventDefault();
    Session.set('newEntry', true)
  },
  'click .edit-project': function(e) {
    e.preventDefault();
    debugger;
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
