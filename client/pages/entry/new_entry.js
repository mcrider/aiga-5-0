

Template.new_entry.events({
  'click #entryList': function(e) {
    e.preventDefault();
    Session.set('newEntry', false);
  },
  'submit #newEntryForm': function (e) {
    e.preventDefault();
    var entryData = utils.getFormValues("#newEntryForm");
    entryData.userId = Meteor.userId();
    Entries.insert(entryData);
    $.pnotify({
      text: 'Your entry was added.',
      type: 'success',
      icon: false,
      addclass: "stack-bottomright",
      stack: utils.pnotify_stack_bottomright
    });
  }
});
