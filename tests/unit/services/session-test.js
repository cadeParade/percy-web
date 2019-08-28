/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {it, describe, beforeEach, afterEach} from 'mocha';
import {setupTest} from 'ember-mocha';
import {make} from 'ember-data-factory-guy';
import {resolve, reject} from 'rsvp';
import sinon from 'sinon';
import utils from 'percy-web/lib/utils';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import SetupLocalStorageSandbox from 'percy-web/tests/helpers/setup-localstorage-sandbox';

describe('SessionService', function() {
  setupTest();
  SetupLocalStorageSandbox();

  describe('loadCurrentUser', function() {
    let subject = null;
    let store = null;
    let user;

    let windowStub;
    beforeEach(function() {
      subject = this.owner.lookup('service:session');
      store = this.owner.lookup('service:store');
      setupFactoryGuy(this);

      user = make('user', 'withOrganizations', {id: 'foo'});
      windowStub = sinon.stub(utils, 'replaceWindowLocation');
    });

    afterEach(function() {
      windowStub.restore();
    });

    describe('when isAuthenticated is false', function() {
      beforeEach(function() {
        subject.set('isAuthenticated', false);
      });

      it('tries to silently authenticate when API returns a user', async function() {
        store.queryRecord = sinon.stub().returns(user);
        const authenticateStub = sinon.stub(subject, 'authenticate');
        const promise = subject.loadCurrentUser();

        return promise.then(() => {
          expect(authenticateStub).to.have.been.calledWith('authenticator:auth0-silent-auth');
        });
      });

      it('invalidates session and logs out when silent auth errors', async function() {
        const invalidateStub = sinon.stub(subject, 'invalidate').returns(resolve());
        store.queryRecord = sinon.stub().returns(user);
        sinon.stub(subject, 'authenticate').returns(reject());

        const promise = subject.loadCurrentUser();

        return promise.then(() => {
          expect(invalidateStub).to.have.been.called;
        });
      });

      it('returns a resolved promise when forceReloadUser errors', function() {
        store.queryRecord = sinon.stub().returns(reject());
        const promise = subject.loadCurrentUser();

        expect(promise).to.be.fulfilled;
      });
    });

    describe('when isAuthenticated is true and the user query passes', function() {
      beforeEach(function() {
        subject.set('isAuthenticated', true);
        store.queryRecord = sinon.stub().returns(resolve(user));
      });

      it('sets current user', function() {
        const promise = subject.loadCurrentUser();

        return promise.then(() => {
          expect(subject.get('currentUser.id')).to.equal(user.get('id'));
        });
      });

      it('sends intercom data', function() {
        window.Intercom = sinon.stub();
        const promise = subject.loadCurrentUser();

        return promise.then(() => {
          expect(window.Intercom).to.have.been.calledWith('update', {
            user_id: user.get('id'),
            user_hash: user.get('userHash'),
            name: user.get('name'),
            email: user.get('email'),
            created_at: user.get('createdAt').getTime() / 1000,
          });
        });
      });

      it('sends sets up analytics data', function() {
        const setupAnalyticsStub = sinon.stub();
        subject.set('analytics.identifyUser', setupAnalyticsStub);
        const promise = subject.loadCurrentUser();

        return promise.then(() => {
          expect(setupAnalyticsStub).to.have.been.calledWith(user);
        });
      });

      it("calls Launch Darkly's identify via _setupLaunchDarkly", function() {
        const identifyStub = sinon.stub();
        subject.set('launchDarkly.identify', identifyStub);

        const promise = subject.loadCurrentUser(user);
        return promise.then(() => {
          expect(identifyStub).to.have.been.calledWith({
            key: user.get('userHash'),
            name: user.get('name'),
            custom: {
              organizations: user.get('organizations').mapBy('id'),
            },
          });
        });
      });
    });

    describe('when isAuthenticated is true and the user query fails', function() {
      beforeEach(function() {
        subject.set('isAuthenticated', true);
        store.queryRecord = sinon.stub().returns(reject());
      });

      it('invalidates the session', function() {
        const invalidateStub = sinon.stub().returns(resolve());
        subject.invalidate = invalidateStub;
        const promise = subject.loadCurrentUser();

        return promise.then(() => {
          expect(invalidateStub).to.have.been.called;
          expect(windowStub).to.have.been.calledWith('/api/auth/logout');
        });
      });

      it('clears analytics user context', function() {
        subject.invalidate = sinon.stub().returns(resolve());
        const analyticsInvalidateStub = sinon.stub();
        subject.set('analytics.invalidate', analyticsInvalidateStub);

        const promise = subject.loadCurrentUser();

        return promise.then(() => {
          expect(analyticsInvalidateStub).to.have.been.called;
        });
      });
    });

    // TODO: unsure how to test a function failing but not break tests.
    describe.skip('when isAuthenticated is true and the third party setup fails', function() {
      beforeEach(function() {
        subject.set('isAuthenticated', true);
        store.queryRecord = sinon.stub().returns(resolve(user));
      });

      it('does not invalidate the session', function() {
        subject.set('_setupSentry', function() {
          throw new Error('foo');
        });
        const invalidateStub = sinon.stub();
        subject.set('invalidate', invalidateStub);

        const promise = subject.loadCurrentUser();

        return promise.then(() => {
          expect(invalidateStub).to.not.have.been.called;
        });
      });
    });
  });
});
