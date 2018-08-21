const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const errors = require('feathers-errors');
const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const ldap = require('../lib/index');

// Initialize the application
const app = feathers();

// Load configuration, usually done by feathers-configuration
app.set('auth', {
  secret: 'super secret',
  ldap: {
    server: {
      url: 'ldap://localhost:389',
      bindDn: 'cn=anonymous',
      bindCredentials: '', // bindpw
      searchBase: 'dc=de',
      searchFilter: '(uid={{username}})',
      searchAttributes: null // set an array of props to fetch from ldap
    }
  }
});

class CustomVerifier {
  verify(req, user, done) {
    // ldap auth was successful
    console.log('LDAP User:', user);

    // add custom verification logic
    let valid = true;
    if (valid) {
      return done(null, user, {username: req.body.username});
    } else {
      const err = new errors.Forbidden('Youre are not allowed');
      return done(err);
    }
  }
}

app.configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

  // Configure feathers-authentication
  .configure(auth(app.get('auth')))

  // Enable JWT auth
  .configure(jwt({
    // Optional: Overwrite the JWT Verifier to disable
    // population from user service
    Verifier: ldap.JWTVerifier
  }))

  // Enable LDAP auth
  .configure(ldap({
    // Optional: overwrite Verifier function
    Verifier: CustomVerifier
  }))

  .use(errorHandler());


// Authenticate the user using the LDAP strategy
// and if successful return a JWT.
app.service('authentication').hooks({
  before: {
    create: [
      auth.hooks.authenticate('ldap'),
      function(hook) {
        // store some user data in JWT payload
        hook.data.payload = {
          uid: hook.params.user.uid,
          name: hook.params.user.cn,
          mail: hook.params.user.mail
        };
        return Promise.resolve(hook);
      }
    ]
  }
});

app.listen(3030);
console.log('Feathers authentication with LDAP auth started on 127.0.0.1:3030');
