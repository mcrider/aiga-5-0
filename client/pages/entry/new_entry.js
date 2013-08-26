

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
    entryData.paid = false;

    // Add any uploaded files
    var files = Session.get('entry-files');
    var fileArray = [];
    if (files) fileArray = JSON.parse(Session.get('entry-files'));
    entryData.files = fileArray;

    Entries.insert(entryData);
    $.pnotify({
      text: 'Your entry was added.',
      type: 'success',
      icon: false,
      addclass: "stack-bottomright",
      stack: utils.pnotify_stack_bottomright,
      sticker: false
    });
    Session.set('newEntry', false);
  },
  'click .filepicker-file': function(e) {
    e.preventDefault();
    var filepickerKey = Settings.findOne().filepickerKey;
    if (!filepickerKey) return false;

    filepicker.setKey(filepickerKey);

    filepicker.pick(
      function(FPFile){
        var files = Session.get('entry-files');
        var fileArray = [];
        if (files) fileArray = JSON.parse(Session.get('entry-files'));
        fileArray.push(FPFile);

        Session.set('entry-files', JSON.stringify(fileArray));

        console.log(FPFile.url);
      }
    );
  },
  'click .icon-remove-sign': function(e) {
    var fileKey = this.key;

    if(fileKey) {
      var filepickerKey = Settings.findOne().filepickerKey;
      if (!filepickerKey) return false;
      filepicker.setKey(filepickerKey);

      filepicker.remove(this, function() {
        var files = Session.get('entry-files');
        if (files) {
          var fileArray = JSON.parse(Session.get('entry-files'));
          fileArray = _.without(fileArray, _.findWhere(fileArray, {key: fileKey}));
          Session.set('entry-files', JSON.stringify(fileArray));
        }
      }, function() { console.log("There was an error deleting the file"); });
    }

  }
});

Template.new_entry.files = function() {
  var files = Session.get('entry-files');
  if (files) return JSON.parse(Session.get('entry-files'));
  return [];
}