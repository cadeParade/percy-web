import {inject as service} from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import {resolve, reject} from 'rsvp';
import {Promise as EmberPromise} from 'rsvp';
import localStorageProxy from 'percy-web/lib/localstorage';
import utils from 'percy-web/lib/utils';
import AdminMode from 'percy-web/lib/admin-mode';

export default SessionService.extend({
  store: service(),
  analytics: service(),
  raven: service(),
  launchDarkly: service(),

  // set by load method
  currentUser: null,

  loadCurrentUser() {
    if (this.get('isAuthenticated')) {
      return (
        this.forceReloadUser()
          .then(async user => {
            this.set('currentUser', user);
            await this._setupThirdPartyUserContexts(user);
          })
          // This catch will be triggered if the queryRecord or set currentUser
          // fails. If we don't have a user, the site will be very broken
          // so kick them out.
          .catch(e => {
            this.invalidateAndLogout();

            this._clearThirdPartyUserContext();
            return reject(e);
          })
      );
    } else {
      // This needs to return a resolved promise because beforeModel in
      // ember-simple-auth application route mixin needs a resolved promise.
      return resolve();
    }
  },

  invalidateAndLogout() {
    this.invalidate().then(() => {
      this._clearThirdPartyUserContext();
      utils.replaceWindowLocation('/api/auth/logout');
    });
  },

  forceReloadUser() {
    return this.get('store').queryRecord('user', {});
  },

  _setupThirdPartyUserContexts(user) {
    if (!user) {
      return;
    }
    // Always resolve this successfully, even if it errors.
    // The user should be able to access the site even if third party services fail.
    return new EmberPromise(async (resolve /*reject*/) => {
      try {
        this._setupSentry(user);
        this._setupAnalytics(user);
        this._setupIntercom(user);
        await this._setupLaunchDarkly(user);
        resolve();
      } catch (_) {
        resolve();
      }
    });
  },

  _clearThirdPartyUserContext() {
    this._clearSentry();
    this._clearAnalytics();
    this._clearIntercom();
    AdminMode.clear();
  },

  _setupSentry(user) {
    if (this.get('raven.isRavenUsable')) {
      this.get('raven').callRaven('setUserContext', {id: user.get('id')});
    }
  },

  _clearSentry() {
    if (this.get('raven.isRavenUsable')) {
      this.get('raven').callRaven('setUserContext');
    }
  },
  _setupAnalytics(user) {
    this.get('analytics').identifyUser(user);
  },
  _clearAnalytics() {
    this.get('analytics').invalidate();
    localStorageProxy.removeKeysWithString('amplitude');
  },
  _setupIntercom(user) {
    if (window.Intercom) {
      window.Intercom('update', {
        user_id: user.get('id'),
        user_hash: user.get('userHash'),
        name: user.get('name'),
        email: user.get('email'),
        created_at: user.get('createdAt').getTime() / 1000,
      });
    }
  },
  _clearIntercom() {
    if (window.Intercom) {
      window.Intercom('shutdown');
    }
    localStorageProxy.removeKeysWithString('intercom');
  },
  async _setupLaunchDarkly(user) {
    const organizations = await user.get('organizations');
    const launchDarklyUser = {
      key: user.get('userHash'),
      name: user.get('name'),
      custom: {
        organizations: organizations.mapBy('id'),
      },
    };
    return this.get('launchDarkly').identify(launchDarklyUser);
  },
});
