

Template.new_entry.events({
  'click #entryList': function(e) {
    e.preventDefault();
    Session.set('newEntry', false);
  },
  'change #type': function(e) {
    var type = $(e.currentTarget).val();
    $('.project_fields').addClass('hidden');
    $('#' + type + '_fields').hide().removeClass('hidden').slideDown(200);
  },
  'click #entry_next': function(e) {
    e.preventDefault();
    $("#project_information").addClass('hidden');
    $("#project_team").hide().removeClass('hidden').fadeIn(200);
  },
  'click #entry_back': function(e) {
    e.preventDefault();
    $("#project_team").addClass('hidden');
    $("#project_information").hide().removeClass('hidden').fadeIn(200);
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
    Session.set('newEntry', false);
  }
});
