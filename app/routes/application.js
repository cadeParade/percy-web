import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth-auth0/mixins/application-route-mixin';
import localStorageProxy from 'percy-web/lib/localstorage';
import {DO_NOT_FORWARD_REDIRECT_ROUTES} from 'percy-web/router';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import isDevWithProductionAPI from 'percy-web/lib/dev-auth';
import {AUTH_REDIRECT_LOCALSTORAGE_KEY} from 'percy-web/router';
import {resolve, reject} from 'rsvp';

// Remove @classic when we can refactor away from mixins
@classic
export default class ApplicationRoute extends Route.extend(
  ApplicationRouteMixin,
  EnsureStatefulLogin,
) {
  @service
  session;

  @service
  confirm;

  @service
  flashMessages;

  @service
  raven;

  @alias('session.currentUser')
  currentUser;

  @service
  launchDarkly;

  @service
  redirects;

  @service
  intercom;

  beforeModel(transition) {
    super.beforeModel(...arguments);
    this._storeTargetTransition(transition);
    if (!this.get('session.isAuthenticated')) {
      // When running our development environment with a production API, we need to shortcut the
      // auth flow otherwise you'll get CSRF detected errors from Auth0. This is somewhat of a hack
      // and means you won't be able to log out or test login functionality in this mode.
      if (isDevWithProductionAPI()) {
        this.set('session.isAuthenticated', true);
      }
    }

    return this._loadLaunchDarkly().then(() => {
      return this._loadCurrentUser();
    });
  }

  // Special case: turn off ember-simple-auth-auth0's application-route-mixin expiration timer.
  // This fixes a specific "mixed auth state" bug where the frontend session can be expired
  // while the backend API session still exists. This bug can only happen when both 1) the user has
  // third-party cookies disabled which breaks Silent Auth, and 2) they have a long-lived tab open
  // which triggers this session expiration.
  //
  // Preventing the frontend session from being cleared in the current tab ensures that,
  // on refresh or next page load, the user will go through a full invalidateAndLogout flow so both
  // frontend/backend sessions will be in sync. See authenticators/auth0-url-hash.js for more info.
  beforeSessionExpired() {
    return reject();
  }

  async _loadLaunchDarkly() {
    const anonUser = {key: 'anon', anonymous: true};
    try {
      return this.launchDarkly.initialize(anonUser);
    } catch (e) {
      // If anything goes wrong with the launch darkly identification, don't crash the app,
      // just return a resolved promise so the app can keep loading.
      return resolve();
    }
  }

  sessionAuthenticated() {
    // This method is called after the session is authenticated by ember-simple-auth.
    // By default, it executes some pre-set redirects but we want our own redirect logic,
    // so we're not calling super here.
    this._loadCurrentUser().then(() => {
      this.closeLock();
      this._decideRedirect();
    });
  }

  _loadCurrentUser() {
    return this.session.loadCurrentUser().catch(() => {
      return this._showLoginFailedFlashMessage();
    });
  }

  @action
  showSupport() {
    // This is necessary for some controller templates and the error template, but otherwise,
    // please import use the service locally.
    this.intercom.showIntercom();
  }

  @action
  showLoginModal() {
    this.showLoginModalEnsuringState();
  }

  @action
  logout() {
    this.session.invalidateAndLogout();
  }

  @action
  navigateToProject(project) {
    let organizationSlug = project.get('organization.slug');
    let projectSlug = project.get('slug');
    this.transitionTo('organization.project.index', organizationSlug, projectSlug);
  }

  @action
  navigateToOrganizationBilling(organization) {
    let organizationSlug = organization.get('slug');
    this.transitionTo('organizations.organization.billing', organizationSlug);
  }

  @action
  navigateToProjectSettings(project) {
    let organizationSlug = project.get('organization.slug');
    let projectSlug = project.get('slug');
    this.transitionTo('organization.project.settings', organizationSlug, projectSlug);
  }

  // See: https://github.com/damiencaselli/ember-cli-sentry/issues/105
  @action
  error(error) {
    if (this.get('raven.isRavenUsable')) {
      this.raven.captureException(error);
    }
    return true; // Let the route above this handle the error.
  }

  _storeTargetTransition(transition) {
    const attemptedRoute = transition.targetName;
    if (!DO_NOT_FORWARD_REDIRECT_ROUTES.includes(attemptedRoute)) {
      const attemptedTransitionUrl = transition.intent.url;
      localStorageProxy.set(AUTH_REDIRECT_LOCALSTORAGE_KEY, attemptedTransitionUrl, {
        useSessionStorage: true,
      });
    }
  }

  _decideRedirect() {
    const redirectAddress = localStorageProxy.get(AUTH_REDIRECT_LOCALSTORAGE_KEY, '/', {
      useSessionStorage: true,
    });
    if (redirectAddress) {
      if (redirectAddress === '/') {
        this.redirects.redirectToDefaultOrganization();
      } else {
        localStorageProxy.removeItem(AUTH_REDIRECT_LOCALSTORAGE_KEY, {useSessionStorage: true});
        this.transitionTo(redirectAddress);
      }
    } else {
      this.redirects.redirectToDefaultOrganization();
    }
  }

  activate() {
    this.flashMessages.displayLocalStorageMessages();
  }

  _showLoginFailedFlashMessage() {
    this.flashMessages.createPersistentFlashMessage(
      {
        type: 'danger',
        message:
          'There was a problem with logging in. \
        Please try again or contact us if the issue does not resolve.',
        sticky: true,
      },
      {persistentReloads: 1},
    );
  }
}
