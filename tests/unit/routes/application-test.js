/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {it, describe, beforeEach, afterEach} from 'mocha';
import {AUTH_CALLBACK_ROUTE} from 'percy-web/router';
import {AUTH_REDIRECT_LOCALSTORAGE_KEY} from 'percy-web/router';
import {setupTest} from 'ember-mocha';

describe('ApplicationRoute', function () {
  let subject;

  setupTest();

  beforeEach(function () {
    sessionStorage.clear();
    subject = this.owner.lookup('route:application');
  });

  afterEach(function () {
    sessionStorage.clear();
  });

  describe('_storeTargetTransition', function () {
    describe('when the route is present in DO_NOT_FORWARD_REDIRECT_ROUTES', function () {
      it('does not store route in sessionStorage', function () {
        subject._storeTargetTransition({targetName: AUTH_CALLBACK_ROUTE});
        expect(sessionStorage.getItem(AUTH_REDIRECT_LOCALSTORAGE_KEY)).to.equal(null);
      });
    });

    describe('when the route is not present in DO_NOT_FORWARD_REDIRECT_ROUTES', function () {
      it('stores route in sessionStorage', function () {
        const fakeRedirectTarget = 'foo/bar/baz';
        subject._storeTargetTransition({intent: {url: fakeRedirectTarget}});
        expect(sessionStorage.getItem(AUTH_REDIRECT_LOCALSTORAGE_KEY)).to.equal(
          `"${fakeRedirectTarget}"`,
        );
      });
    });
  });
});
