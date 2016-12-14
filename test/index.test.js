import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import ldapAuth from '../src';
import feathers from 'feathers';
import authentication from 'feathers-authentication';
import passportLdap from 'passport-ldapauth';
chai.use(sinonChai);

describe('feathers-authentication-ldap', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', () => {
    expect(typeof ldapAuth).to.equal('function');
    expect(typeof ldapAuth()).to.equal('function');
  });

  it('exposes the default Verifier fn', () => {
    expect(typeof ldapAuth.Verifier).to.equal('function');
  });

  it('exposes the defaults obj', () => {
    expect(typeof ldapAuth.defaults).to.equal('object');
  });

  describe('defaultVerifier fn', () => {
    it('should cb without error', function (done) {
      let verifier = new ldapAuth.Verifier();
      verifier.verify({body: {username: 'test'}}, {name: 'test'}, done);
    });
  });

  describe('jwtVerifier fn', () => {
    it('should cb without error', function (done) {
      let jwtVerifier = new ldapAuth.JWTVerifier();
      jwtVerifier.verify({body: {username: 'test'}}, {name: 'test'}, done);
    });
  });

  describe('initialization', () => {
    let app;

    beforeEach(() => {
      app = feathers();
      app.configure(authentication({secret: 'supersecret'}));
    });

    it('throws an error if passport has not been registered', () => {
      expect(() => {
        feathers().configure(ldapAuth());
      }).to.throw();
    });

    it('registers the ldap passport strategy', () => {
      sinon.spy(app.passport, 'use');
      sinon.spy(passportLdap, 'Strategy');
      app.configure(ldapAuth());
      app.setup();

      expect(passportLdap.Strategy).to.have.been.calledOnce;
      expect(app.passport.use).to.have.been.calledWith('ldap');

      app.passport.use.restore();
      passportLdap.Strategy.restore();
    });

    it('registers the strategy options', () => {
      sinon.spy(app.passport, 'options');
      app.configure(ldapAuth());
      app.setup();

      expect(app.passport.options).to.have.been.calledOnce;

      app.passport.options.restore();
    });
  });
});
