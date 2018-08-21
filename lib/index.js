const Debug = require('debug');
const merge = require('lodash.merge');
const omit = require('lodash.omit');
const DefaultVerifier = require('./verifier');

const passportLdap = require('passport-ldapauth');

const debug = Debug('feathers-authentication-ldap');
const defaults = {
  name: 'ldap',
  server: {
    url: 'ldap://localhost:389',
    bindDn: 'cn=anonymous',
    bindCredentials: '',
    searchBase: 'dc=de',
    searchFilter: '(uid={{username}})',
    searchAttributes: null
  },
  passReqToCallback: true
};

class JWTVerifier {
  // JWT Verifier replacement
  // to disable population from user service
  verify (req, payload, done) {
    done(null, { payload });
  }
}

function init (options = {}) {
  return function ldapAuth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before @feathersjs/authentication-ldap?`);
    }

    let name = options.name || defaults.name;
    let authOptions = app.get('authentication') || app.get('auth') || {};
    let ldapOptions = authOptions[name] || {};
    const ldapSettings = merge({}, defaults, ldapOptions, omit(options, ['Verifier, AsyncOptions']));
    const asyncOptions = options.asyncOptions || null;
    let Verifier = DefaultVerifier;

    if (options.Verifier) {
      Verifier = options.Verifier;
    }

    // function to get dynamic settings when using asyncOptions in strategy
    const getLdapSettings = (req, passportCallback) => {
      passportCallback(null, merge({}, ldapSettings, asyncOptions(req)));
    };

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, ldapSettings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as function(request, user, done)`);
      }

      debug('Registering ldap authentication strategy with options:', ldapSettings);
      app.passport.use(ldapSettings.name, new passportLdap.Strategy((asyncOptions ? getLdapSettings : ldapSettings), verifier.verify.bind(verifier)));
      app.passport.options(ldapSettings.name, ldapSettings); // do we need this ??

      return result;
    };
  };
}

module.exports = init;

// Exposed Modules
Object.assign(module.exports, {
  default: init,
  defaults,
  Verifier: DefaultVerifier,
  JWTVerifier
});
