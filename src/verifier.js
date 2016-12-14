import Debug from 'debug';

const debug = Debug('feathers-authentication-ldap:verify');

class LDAPVerifier {
  constructor (app, options = {}) {
    this.app = app;
    this.options = options;

    this.verify = this.verify.bind(this);
  }

  verify (req, user, done) {
    // no further validation, LDAP Account is valid
    debug('Received ldap user:', user);
    const payload = { username: req.body.username };
    done(null, user, payload);
  }
}

export default LDAPVerifier;
