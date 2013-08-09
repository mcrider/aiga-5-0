

Template.edit_entry.events({
  'click .entry-back': function(e) {
    e.preventDefault();

    var $container = $(e.currentTarget).parent().parent();
    $container.find('.edit-entry-form').fadeOut(200, function(){
      $container.find('.entry-info').fadeIn(200);
      $container.parent().find('.editing').text('Edit').removeClass('editing');
    });
  },
  'submit .edit-entry-form': function (e) {
    e.preventDefault();

    var entryData = utils.getFormValues($(e.currentTarget));
    Entries.update({_id: this._id}, {$set: entryData});
    $.pnotify({
      text: 'Your entry was saved.',
      type: 'success',
      icon: false,
      addclass: "stack-bottomright",
      stack: utils.pnotify_stack_bottomright
    });

    var $container = $(e.currentTarget).parent().parent();
    $container.find('.edit-entry-form').fadeOut(200, function(){
      $container.find('.entry-info').fadeIn(200);
      $container.parent().find('.editing').text('Edit').removeClass('editing');
    });
  }
});

Template.edit_entry.typeEquals = function (typeOne, typeTwo) {
  return typeOne === typeTwo;
};

Template.edit_entry.typeNotEquals = function (typeOne, typeTwo) {
  return typeOne !== typeTwo;
};