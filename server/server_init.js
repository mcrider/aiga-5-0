// Server-side startup code (set up collections, add default data if needed)

Meteor.startup(function () {
  process.env.MAIL_URL="smtp://aiga50entry%40gmail.com:aiga1914HNL@smtp.gmail.com:465/";

  // Helper functions for authorization
  authorize = {
    authorsAndAdmins: function() {
      if (Meteor.user() && Roles.userIsInRole(Meteor.user(), ['author','admin'])) {
        return true;
      }
      return false;
    },
    admins: function() {
      if (Meteor.user() && Roles.userIsInRole(Meteor.user(), ['admin'])) {
        return true;
      }
      return false;
    }
  }

  // Pages
  Pages = new Meteor.Collection("pages");
  Meteor.publish('pages', function () {
    return Pages.find();
  });
  Pages.allow({
    insert: authorize.authorsAndAdmins,
    update: authorize.authorsAndAdmins,
    remove: authorize.authorsAndAdmins
  });
  if (Pages.find().count() === 0) {
    // Insert default data
    Pages.insert({
      title: "Home",
      slug: "home",
      contents: "<p>Welcome to Azimuth.</p><p>You can add pages from the <i class='icon-cogs'></i>  menu above.</p>",
      template: "page_default"
    });
    Pages.insert({
      title: "About",
      slug: "about",
      contents: "<p>Replace this with some text about your site.</p>",
      template: "page_default"
    });
  }

  // Blocks
  Meteor.publish('blocks', function () {
    return Blocks.find();
  });
  Blocks = new Meteor.Collection("blocks");
  Blocks.allow({
    insert: authorize.authorsAndAdmins,
    update: authorize.authorsAndAdmins,
    remove: authorize.authorsAndAdmins
  });

  // PageBlocks -- Links block instances and the pages that contain them
  Meteor.publish('pageBlocks', function () {
    return PageBlocks.find();
  });
  PageBlocks = new Meteor.Collection("pageBlocks");
  PageBlocks.allow({
    insert: authorize.authorsAndAdmins,
    update: authorize.authorsAndAdmins,
    remove: authorize.authorsAndAdmins
  });

  // Users
  Meteor.publish('user_list', function () {
    if (Roles.userIsInRole(this.userId, ['admin'])) {
      return Meteor.users.find();
    } else {
      // Not authorized
      this.stop();
      return;
    }
  });

  Meteor.users.allow({
    insert: authorize.admins,
    update: authorize.admins,
    remove: authorize.admins
  });

  // Roles
  Meteor.publish('roles', function () {
    if(Meteor.users.find().count() == 1 && this.userId && !Roles.userIsInRole(this.userId, ['admin'])) {
      // Add first user to admin role
      Roles.addUsersToRoles(Meteor.user()._id, ['admin']);
    }
    return Meteor.roles.find();
  });
  Meteor.roles.allow({
    insert: authorize.admins,
    update: authorize.admins,
    remove: authorize.admins
  });

  // Site settings
  Settings = new Meteor.Collection("settings");
  Meteor.publish('settings', function () {
    return Settings.find();
  });
  Settings.allow({
    insert: authorize.admins,
    update: authorize.admins,
    remove: authorize.admins
  });
  if (Settings.find().count() === 0) {
    Settings.insert({
        siteName: "Azimuth CMS",
        indexPage: "home",
        showLoginInHeader: true,
        addNewPagesToHeader: true,
        theme: 'flatBlue'
      });
  }

  // Header and footer navigation
  Navigation = new Meteor.Collection("navigation");
  Meteor.publish('navigation', function () {
    return Navigation.find();
  });
  Navigation.allow({
    insert: authorize.admins,
    update: authorize.admins,
    remove: authorize.admins
  });
  if (!Navigation.findOne({location: "header_active"})) {
  	var nav = [];
    Pages.find().forEach(function(page) {
      nav.push({id: page._id, title: page.title, slug: page.slug});
    });
    Navigation.insert({location: "header_active", pages: nav});
    Navigation.insert({location: "header_disabled", pages: []});
    Navigation.insert({location: "footer_active", pages: nav});
    Navigation.insert({location: "footer_disabled", pages: []});
  }

   // Pages
  Entries = new Meteor.Collection("entries");
  Meteor.publish('entries', function () {
    if (this.userId && Roles.userIsInRole(this.userId, ['admin'])) {
      return Entries.find();
    } else {
      return Entries.find({userId: this.userId});
    }
  });
  Entries.allow({
    insert: function (userId, doc) {
      // the user must be logged in, and the document must be owned by the user
      return true;
    },
    update: function (userId, doc, fields, modifier) {
      // can only change your own documents
      return doc.userId === userId || authorize.admins;
    },
    remove: function (userId, doc) {
      // can only remove your own documents
      return doc.userId === userId || authorize.admins;
    },
  });
});

Meteor.methods({
  makePayment: function(token, amount, userId) {
    var Stripe = StripeAPI('sk_test_c1VKEVobavL9uRG8NdkePVU3');
    Stripe.charges.create({
      amount: amount,
      currency: "USD",
      card: token
    }, function (err, res) {
      if(err) {
        console.log('Error making payment');
      } else {
        console.log(err, res);
      }
    });
  },
  setAsPaid: function(userId) {
    if(!authorize.admins) return false;
    Entries.find({userId: userId, paid: false}).forEach(function(entry) {
      Entries.update(entry._id, {$set: {paid: Date.now()}});
    })

  },
  setAsUnpaid: function(userId) {
    if(!authorize.admins) return false;
    Entries.find({userId: userId}).forEach(function(entry) {
      Entries.update(entry._id, {$set: {paid: false}});
    })
  },
  sendWelcomeEmail: function (to) {
    // Note: SMTP must be set up as an environment variable such as
    // export MAIL_URL=smtp://foo%40gmail.com:password@smtp.gmail.com:465/

    check([to], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: to,
      from: 'noreply@aigahonolulu.org',
      subject: 'Your AIGA Honolulu 5-0 Awards account is ready!',
      text: 'You have been signed up to submit entries for the AIGA Honolulu 5-0 Award show.\n\nLog in to http://enter.aigahonolulu.org to start submitting entries!\n\n- The AIGA Honolulu Team'
    });
  },
  sendPaymentEmail: function (to) {
    // Note: SMTP must be set up as an environment variable such as
    // export MAIL_URL=smtp://foo%40gmail.com:password@smtp.gmail.com:465/

    check([to], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: to,
      from: 'noreply@aigahonolulu.org',
      subject: 'Your payment has been received',
      text: 'We have received your payment for your entries to the AIGA Honolulu 5-0 Awards.  Please note that you may still submit entries and pay for them separately.\n\n- The AIGA Honolulu Team'
    });
  }
});
