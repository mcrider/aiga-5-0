
var VALID_KEYS = [
  'dropdownVisible',

  // XXX consider replacing these with one key that has an enum for values.
  'inSignupFlow',
  'inForgotPasswordFlow',
  'inChangePasswordFlow',
  'inMessageOnlyFlow',

  'errorMessage',
  'infoMessage',

  // dialogs with messages (info and error)
  'resetPasswordToken',
  'enrollAccountToken',
  'justVerifiedEmail',

  'configureLoginServiceDialogVisible',
  'configureLoginServiceDialogServiceName',
  'configureLoginServiceDialogSaveDisabled'
];

var validateKey = function (key) {
  if (!_.contains(VALID_KEYS, key))
    throw new Error("Invalid key in loginButtonsSession: " + key);
};

var KEY_PREFIX = "Meteor.loginButtons.";

Accounts.ui.currentSelectorScope = null;

// XXX we should have a better pattern for code private to a package like this one
Accounts._loginButtonsSession = {
  set: function(key, value) {
    validateKey(key);
    if (_.contains(['errorMessage', 'infoMessage'], key))
      throw new Error("Don't set errorMessage or infoMessage directly. Instead, use errorMessage() or infoMessage().");

    this._set(key, value);
  },

  _set: function(key, value) {
    Session.set(KEY_PREFIX + key, value);
  },

  get: function(key) {
    validateKey(key);
    return Session.get(KEY_PREFIX + key);
  },

  closeDropdown: function () {
    this.set('inSignupFlow', false);
    this.set('inForgotPasswordFlow', false);
    this.set('inChangePasswordFlow', false);
    this.set('inMessageOnlyFlow', false);
    this.set('dropdownVisible', false);
    this.resetMessages();
  },

  infoMessage: function(message) {
    this._set("errorMessage", null);
    this._set("infoMessage", message);
    this.ensureMessageVisible();
  },

  errorMessage: function(message) {
    this._set("errorMessage", message);
    this._set("infoMessage", null);
    this.ensureMessageVisible();
  },

  // is there a visible dialog that shows messages (info and error)
  isMessageDialogVisible: function () {
    return this.get('resetPasswordToken') ||
      this.get('enrollAccountToken') ||
      this.get('justVerifiedEmail');
  },

  // ensure that somethings displaying a message (info or error) is
  // visible.  if a dialog with messages is open, do nothing;
  // otherwise open the dropdown.
  //
  // notably this doesn't matter when only displaying a single login
  // button since then we have an explicit message dialog
  // (_loginButtonsMessageDialog), and dropdownVisible is ignored in
  // this case.
  ensureMessageVisible: function () {
    if (!this.isMessageDialogVisible())
      this.set("dropdownVisible", true);
  },

  resetMessages: function () {
    this._set("errorMessage", null);
    this._set("infoMessage", null);
  },

  configureService: function (name) {
    this.set('configureLoginServiceDialogVisible', true);
    this.set('configureLoginServiceDialogServiceName', name);
    this.set('configureLoginServiceDialogSaveDisabled', true);
  }
};

if (!Accounts._loginButtons)
  Accounts._loginButtons = {};

// for convenience
var loginButtonsSession = Accounts._loginButtonsSession;

Handlebars.registerHelper(
  "loginButtons",
  function (options) {
    if (options.hash.align === "right")
      return new Handlebars.SafeString(Template._loginButtons({align: "right"}));
    else
      return new Handlebars.SafeString(Template._loginButtons({align: "left"}));
  });

// shared between dropdown and single mode
Template._loginButtons.events({
  'click #login-buttons-logout': function() {
    Meteor.logout(function () {
      loginButtonsSession.closeDropdown();
    });
  }
});

Template._loginButtons.preserve({
  'input[id]': Spark._labelFromIdOrName
});

//
// loginButtonLoggedOut template
//

Template._loginButtonsLoggedOut.dropdown = function () {
  return Accounts._loginButtons.dropdown();
};

Template._loginButtonsLoggedOut.services = function () {
  return Accounts._loginButtons.getLoginServices();
};

Template._loginButtonsLoggedOut.singleService = function () {
  var services = Accounts._loginButtons.getLoginServices();
  if (services.length !== 1)
    throw new Error(
      "Shouldn't be rendering this template with more than one configured service");
  return services[0];
};

Template._loginButtonsLoggedOut.configurationLoaded = function () {
  return Accounts.loginServicesConfigured();
};

//
// loginButtonsLoggedIn template
//

// decide whether we should show a dropdown rather than a row of
// buttons
Template._loginButtonsLoggedIn.dropdown = function () {
  return Accounts._loginButtons.dropdown();
};

Template._loginButtonsLoggedIn.displayName = function () {
  return Accounts._loginButtons.displayName();
};

//
// loginButtonsMessage template
//

Template._loginButtonsMessages.errorMessage = function () {
  return loginButtonsSession.get('errorMessage');
};

Template._loginButtonsMessages.infoMessage = function () {
  return loginButtonsSession.get('infoMessage');
};

//
// loginButtonsLoggingInPadding template
//

Template._loginButtonsLoggingInPadding.dropdown = function () {
  return Accounts._loginButtons.dropdown();
};

//
// helpers
//

Accounts._loginButtons.displayName = function () {
  var user = Meteor.user();
  if (!user)
    return '';

  if (user.profile && user.profile.name)
    return user.profile.name;
  if (user.username)
    return user.username;
  if (user.emails && user.emails[0] && user.emails[0].address)
    return user.emails[0].address;

  return '';
};

// returns an array of the login services used by this app. each
// element of the array is an object (eg {name: 'facebook'}), since
// that makes it useful in combination with handlebars {{#each}}.
//
// NOTE: It is very important to have this return password last
// because of the way we render the different providers in
// login_buttons_dropdown.html
Accounts._loginButtons.getLoginServices = function () {
  var self = this;
  var services = [];

  // find all methods of the form: `Meteor.loginWithFoo`, where
  // `Foo` corresponds to a login service
  //
  // XXX we should consider having a client-side
  // Accounts.oauth.registerService function which records the
  // active services and encapsulates boilerplate code now found in
  // files such as facebook_client.js. This would have the added
  // benefit of allow us to unify facebook_{client,common,server}.js
  // into one file, which would encourage people to build more login
  // services packages.
  _.each(_.keys(Meteor), function(methodName) {
    var match;
    if ((match = methodName.match(/^loginWith(.*)/))) {
      var serviceName = match[1].toLowerCase();

      // HACKETY HACK. needed to not match
      // Meteor.loginWithToken. See XXX above.
      if (Accounts[serviceName])
        services.push(match[1].toLowerCase());
    }
  });

  // Be equally kind to all login services. This also preserves
  // backwards-compatibility. (But maybe order should be
  // configurable?)
  services.sort();

  // ensure password is last
  if (_.contains(services, 'password'))
    services = _.without(services, 'password').concat(['password']);

  return _.map(services, function(name) {
    return {name: name};
  });
};

Accounts._loginButtons.hasPasswordService = function () {
  return Accounts.password;
};

Accounts._loginButtons.dropdown = function () {
  return Accounts._loginButtons.hasPasswordService() || Accounts._loginButtons.getLoginServices().length > 1;
};

// XXX improve these. should this be in accounts-password instead?
//
// XXX these will become configurable, and will be validated on
// the server as well.
Accounts._loginButtons.validateUsername = function (username) {
  if (username.length >= 3) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Username must be at least 3 characters long");
    return false;
  }
};
Accounts._loginButtons.validateEmail = function (email) {
  if (Accounts.ui._passwordSignupFields() === "USERNAME_AND_OPTIONAL_EMAIL" && email === '')
    return true;

  if (email.indexOf('@') !== -1) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Invalid email");
    return false;
  }
};
Accounts._loginButtons.validatePassword = function (password) {
  if (password.length >= 6) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Password must be at least 6 characters long");
    return false;
  }
};

/* MC: Custom Validators */
Accounts._loginButtons.validatePasswordsMatch = function (password, passwordAgain) {
  if (password == passwordAgain) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Passwords do not match");
    return false;
  }
};

Accounts._loginButtons.validateContactName = function (contact) {
  if (contact.length >= 1) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Please include a contact name");
    return false;
  }
};

Accounts._loginButtons.validateContactPhone = function (phone) {
  if (phone.length >= 1) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Please include a contact phone number");
    return false;
  }
};
