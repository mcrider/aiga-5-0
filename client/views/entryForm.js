

Template.print_form.user_label = function() {
  var user = Meteor.user();
  if (user && user.profile && user.profile.contact_name) return user.profile.contact_name;
  else if (user && user.emails[0].address) return user.emails[0].address;
  else return '';
}

Template.print_form.user = function() {
  var user = Meteor.user;
  if (user && user.profile) return user;
  else return null;
}

Template.print_form.entries = function() {
  return Entries.find({userId: Meteor.userId()});
}


Template.print_form.typeEquals = function (typeOne, typeTwo) {
  return typeOne === typeTwo;
};

Template.print_form.typeNotEquals = function (typeOne, typeTwo) {
  return typeOne !== typeTwo;
};

Template.print_form.rendered = function() {
  window.setTimeout(function() {
    window.print();
  }, 3000);
}