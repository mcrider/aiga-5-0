Template.admin_edit_entry.events({
  'submit .admin-edit-entry-form': function (e) {
    e.preventDefault();

    var entryData = utils.getFormValues($(e.currentTarget));
    Entries.update({_id: this._id}, {$set: entryData});
    $.pnotify({
      text: 'Your entry was saved.',
      type: 'success',
      icon: false,
      addclass: "stack-bottomright",
      stack: utils.pnotify_stack_bottomright,
      sticker: false
    });

    var $container = $(e.currentTarget).parent().parent();
    $container.find('.admin-edit-entry-form').addClass('hidden');
    $container.find('.entry-info').removeClass('hidden');
    $container.parent().find('.editing').text('Edit').removeClass('editing');
  },
  'click .filepicker-file': function(e) {
    e.preventDefault();

    var filepickerKey = Settings.findOne().filepickerKey;
    if (!filepickerKey) return false;
    filepicker.setKey(filepickerKey);

    var entryId = this._id;
    filepicker.pick(
      function(FPFile){

        var entry = Entries.findOne(entryId);
        var files = entry.files;
        files.push(FPFile);
        Entries.update(entryId, {$set: {files: files}});

        console.log(FPFile.url);
      }
    );
  },
  'click .icon-remove-sign': function(e) {
    var entryId = $(e.currentTarget).closest('.admin-edit-entry-form').data('entry-id');
    var entry = Entries.findOne(entryId);

    var fileKey = this.key;

    if(entry) {
      var filepickerKey = Settings.findOne().filepickerKey;
      if (!filepickerKey) return false;
      filepicker.setKey(filepickerKey);

      filepicker.remove(this, function() {
        var files = _.without(entry.files, _.findWhere(entry.files, {key: fileKey}));
        Entries.update(entryId, {$set: {files: files}});
      }, function() { console.log("There was an error deleting the file"); });
    }

  }
});

Template.admin_edit_entry.typeEquals = function (typeOne, typeTwo) {
  return typeOne === typeTwo;
};

Template.admin_edit_entry.typeNotEquals = function (typeOne, typeTwo) {
  return typeOne !== typeTwo;
};