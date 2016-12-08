# feathers-authentication-ldap Example

This provides an  example on how to use `feathers-authentication-ldap` to provide ldap authentication 
and get a JWT access token in return.

1. Configure your LDAP settings in `app.js`
2. Start the app by running `npm start`
3. Make a request using the authenticated user.

```bash
curl -H "Content-Type: application/json" -X POST -d '{"username":"ldap-user@example.com","password":"admin"}' http://localhost:3030/authentication
```
