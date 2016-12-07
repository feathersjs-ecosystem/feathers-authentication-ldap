// import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('feathers-authentication-ldap');

export default function init () {
  debug('Initializing feathers-authentication-ldap plugin');
  return 'feathers-authentication-ldap';
}
