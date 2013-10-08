Template.admin_users.users = function() {
  return Meteor.users.find();
};

Template.admin_users.entryCount = function() {
  var userId = this._id;
  return Entries.find({userId: userId}).count();
}

Template.admin_users.events = {
  'click .admin': function() {
    if(!this._id) return false;
    if(Meteor.userId() == this._id) return false; // Can't un-admin yourself
    if(_.contains(this.roles, "admin")) Roles.removeUsersFromRoles([this._id], ['admin']);
    else Roles.addUsersToRoles([this._id], ['admin']);
  },
  'click .author': function() {
    if(!this._id) return false;
    if(_.contains(this.roles, "author")) Roles.removeUsersFromRoles([this._id], ['author']);
    else Roles.addUsersToRoles([this._id], ['author']);
  },
  'click .delete-user': function (e) {
    e.preventDefault();
    Session.set('delete-user-id', this._id);
    $('#deleteUserModal').modal('show');
  },
  'click .delete-user-confirm': function(e) {
    e.preventDefault();
    $('#deleteUserModal').modal('hide');
    var userId = Session.get('delete-user-id')
    if(!userId) return false;

    if(Meteor.userId() == userId) return false; // Can't delete yourself

    Roles.removeUsersFromRoles([userId], ['admin']);
    Roles.removeUsersFromRoles([userId], ['author']);
    Meteor.users.remove(userId);
  },
  'click .numberCircle': function(e) {
    e.preventDefault();
    Session.set('adminUserId', this._id);
  },
  'click .get-file-data': function(e) {
    var data = [];
    var blankOrVal = function(val) {
      if(val) return val.replace(/(\r\n|\n|\r)/gm," ").replace(/,/g , ";").replace(/"/g, '\"').replace(/'/g, '\'');
      else return "";
    }

    Entries.find().forEach(function(item) {
      var user = Meteor.users.findOne(item.userId);
      entry = {};

      entry.id = blankOrVal(item._id); // ID
      if(user) {
        entry.contact_name = blankOrVal(user.profile.contact_name); // Submitter's Name
        entry.email = blankOrVal(user.emails[0].address); // Submitter's Email
        entry.phone = blankOrVal(user.profile.phone); // Submitter's Agency
        entry.agency_name = blankOrVal(user.profile.agency_name); // Submitter's Agency
        entry.aiga_id = blankOrVal(user.profile.aiga_id); // Submitter's AIGA ID
      }

      entry.url = blankOrVal(item.url); // URL/Paper Company
      entry.art_director = blankOrVal(item.art_director); // Art Director
      entry.designer = blankOrVal(item.designer); // Designer
      entry.illustrator = blankOrVal(item.illustrator); // Illustrator
      entry.copywriter = blankOrVal(item.copywriter); // Copywriter
      entry.photographer = blankOrVal(item.photographer); // Photographer
      entry.special_consultant = blankOrVal(item.special_consultant); // Special Consultant
      entry.paper = blankOrVal(item.paper); // Paper
      entry.developer = blankOrVal(item.developer); // Developer
      entry.animator = blankOrVal(item.animator); // Animator
      entry.tech_info = blankOrVal(item.tech_info); // Technical information
      entry.project_description = blankOrVal(item.project_description); // Project Description
      entry.notes = blankOrVal(item.notes); // Notes

      if(item.files) entry.files = item.files;

      data.push(entry);
    });

    debugger;
    var json = JSON.stringify(data);
    var blob = new Blob([json], {type: "application/json"});
    var url  = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.download    = "entries.json";
    a.href        = url;
    a.click();
  },
  'click .get-user-data': function(e) {
    data = [["ID","Type","Submitter's Name","Submitter's Email","Submitter's Phone","Submitter's Agency","Submitter's AIGA ID","Project Name","Client Name","Date paid","URL/Paper Company","Art Director","Designer","Illustrator","Copywriter","Photographer","Special Consultant","Paper","Developer","Animator","Technical information","Project Description","Notes"]];
    var blankOrVal = function(val) {
      if(val) return val.replace(/(\r\n|\n|\r)/gm," ").replace(/,/g , ";").replace(/"/g, '\"').replace(/'/g, '\'');
      else return "";
    }
    Entries.find().forEach(function(item) {
      var user = Meteor.users.findOne(item.userId);
      entry = [];
      entry.push(blankOrVal(item._id)); // ID
      entry.push(blankOrVal(item.type)); // Type

      if(user) {
        entry.push(blankOrVal(user.profile.contact_name)); // Submitter's Name
        entry.push(blankOrVal(user.emails[0].address)); // Submitter's Email
        entry.push(blankOrVal(user.profile.phone)); // Submitter's Agency
        entry.push(blankOrVal(user.profile.agency_name)); // Submitter's Agency
        entry.push(blankOrVal(user.profile.aiga_id)); // Submitter's AIGA ID
      } else entry.concat(["","","","",""]);
      entry.push(blankOrVal(item.project_name)); // Project Name
      entry.push(blankOrVal(item.client_name)); // Client Name
      if(!item.paid) {
        entry.push("");
      } else {
        entry.push(utils.displayHumanReadableDate(item.paid)); // Date paid
      }
      entry.push(blankOrVal(item.url)); // URL/Paper Company

      entry.push(blankOrVal(item.art_director)); // Art Director
      entry.push(blankOrVal(item.designer)); // Designer
      entry.push(blankOrVal(item.illustrator)); // Illustrator
      entry.push(blankOrVal(item.copywriter)); // Copywriter
      entry.push(blankOrVal(item.photographer)); // Photographer
      entry.push(blankOrVal(item.special_consultant)); // Special Consultant
      entry.push(blankOrVal(item.paper)); // Paper
      entry.push(blankOrVal(item.developer)); // Developer
      entry.push(blankOrVal(item.animator)); // Animator
      entry.push(blankOrVal(item.tech_info)); // Technical information
      entry.push(blankOrVal(item.project_description)); // Project Description
      entry.push(blankOrVal(item.notes)); // Notes


      data.push(entry);
    })
    // var data = [["name1", "city1", "some other info"], ["name2", "city2", "more info"]];
    var csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(function(infoArray, index){
       dataString = infoArray.join(",");
       csvContent += dataString + "\n";
    });

    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);

    // var encodedUri = encodeURI(csvContent);
    // var link = document.createElement("a");
    // link.setAttribute("href", encodedUri);
    // link.setAttribute("download", "my_data.csv");

    // link.click();
  }
};


// Renders the header template (delaying load until site settings are available)
Template.admin_users.helpers({
  renderSidebar: function (block) {
    if (Session.get('adminUserId')) {
      var fragment = Template['admin_entry_list'](); // this calls the template and returns the HTML.
      return fragment;
    } else {
      return '';
    }
  }
});