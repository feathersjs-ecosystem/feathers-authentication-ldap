import Debug from 'debug';
import merge from 'lodash.merge';
import omit from 'lodash.omit';
import DefaultVerifier from './verifier';
import { Strategy as LdapStrategy } from 'passport-ldapauth';

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

// Export ldap-auth init function
export default function init (options = {}) {
  return function ldapAuth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-ldap?`);
    }

    // Construct ldapSettings for passport ldap strategy
    let name = (typeof(options) !== 'function' && options.name) || defaults.name;
    let authOptions = app.get('auth') || {};
    let ldapOptions = authOptions[name] || {};
    const ldapSettings = merge({}, defaults, ldapOptions, (typeof options === 'function' ? {} : omit(options, ['Verifier'])));
    const Verifier = options.Verifier || DefaultVerifier;
    const asyncOptions = function (req, callback) {
      options(req)
      .then(function (opts) {
        callback(null, merge({}, ldapSettings, opts));
      })
      .catch(function (err) {
        callback(err, ldapSettings);
      });
    };
    const ldapStrategySettings = (typeof options === 'function' ? asyncOptions : ldapSettings);

    // plugin setup: register strategy in feathers passport
    app.setup = function () {
      // be sure feathers setup was called
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, ldapSettings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as function(request, user, done)`);
      }

      // Register 'ldap' strategy with passport
      debug('Registering ldap authentication strategy with options:', ldapSettings);
      app.passport.use(ldapSettings.name, new LdapStrategy(ldapStrategySettings, verifier.verify.bind(verifier)));
      app.passport.options(ldapSettings.name, ldapSettings); // do we need this ??

      return result;
    };
  };
}

// Exposed Modules
Object.assign(init, {
  defaults,
  Verifier: DefaultVerifier,
  JWTVerifier
});
