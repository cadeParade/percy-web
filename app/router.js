import {on} from '@ember/object/evented';
import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export const AUTH_REDIRECT_LOCALSTORAGE_KEY = 'percyAttemptedTransition';
export const AUTH_CALLBACK_ROUTE = 'auth-callback';
const VERIFY_EMAIL_ROUTE = 'verify-email';
const VERIFICATION_REQUIRED_ROUTE = 'email-verification-required';
const DUPLICATE_EMAIL_ROUTE = 'duplicate-email';
const SSO_LOGIN_ROUTE = 'sso-login';
const SECOND_SAML_IDENTITY_ERROR = 'second-saml-identity-error';
const PASSWORD_RESET_ROUTE = 'password-reset';
const PASSWORD_UPDATED_ROUTE = 'password-updated';
const LOGIN_ROUTE = 'login';
const SIGNUP_ROUTE = 'signup';

export const DO_NOT_FORWARD_REDIRECT_ROUTES = [
  AUTH_CALLBACK_ROUTE,
  VERIFY_EMAIL_ROUTE,
  VERIFICATION_REQUIRED_ROUTE,
  DUPLICATE_EMAIL_ROUTE,
  SSO_LOGIN_ROUTE,
  SECOND_SAML_IDENTITY_ERROR,
  PASSWORD_RESET_ROUTE,
  PASSWORD_UPDATED_ROUTE,
  LOGIN_ROUTE,
  SIGNUP_ROUTE,
];

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  notifyAnalytics: on('didTransition', function() {
    if (window.ga) {
      window.ga('send', 'pageview', {page: this.url});
    }

    if (window.Intercom) {
      window.Intercom('update');
    }

    if (window.analytics) {
      window.analytics.page();
    }

    return true;
  }),
});

Router.map(function() {
  this.route('join', {path: '/join/:invite_code'});
  this.route('auth-failure', {path: 'auth/failure'});
  this.route(AUTH_CALLBACK_ROUTE, {path: '/auth/callback'});
  this.route(VERIFY_EMAIL_ROUTE, {path: '/auth/verify-email'});
  this.route(VERIFICATION_REQUIRED_ROUTE, {path: '/auth/email-verification-required'});
  this.route(DUPLICATE_EMAIL_ROUTE, {path: '/auth/duplicate-email'});
  this.route(SSO_LOGIN_ROUTE, {path: '/auth/sso-login'});
  this.route(SECOND_SAML_IDENTITY_ERROR, {path: '/auth/second-saml-identity-error'});
  this.route(PASSWORD_RESET_ROUTE, {path: '/auth/password-reset'});
  this.route(PASSWORD_UPDATED_ROUTE, {path: '/auth/password-updated'});
  // Docs and child routes are deprecated and are intercepted in docs route for redirect.
  this.route('docs', {}, function() {
    this.route('page', {path: '*path'});
  });
  this.route(LOGIN_ROUTE);
  this.route(SIGNUP_ROUTE);
  this.route('pricing');
  this.route('enterprise');
  this.route('team');
  this.route('about'); // Redirects to team in route.
  this.route('terms');
  this.route('privacy');
  this.route('security');
  this.route('admin');
  this.route('changelog', function() {
    this.route('show', {path: ':slug'});
  });
  this.route('features');
  this.route('how-it-works');
  this.route('visual-testing');
  this.route('schedule-demo');
  this.route('integrations');
  this.route('customers');
  this.route('settings', function() {
    this.route('profile');
    this.route('connected-accounts');
    this.route('display-preferences');
    this.route('notifications');
  });
  this.route('setup', {}, function() {
    this.route('github-app');
  });
  this.route('default-org');
  this.route('recent-project');

  this.route('organizations', {}, function() {
    this.route('new');
    this.route('organization', {path: '/:organization_id'}, function() {
      this.route('setup');
      this.route('projects', {}, function() {
        this.route('new');
        this.route('new-demo');
      });
      this.route('settings');
      this.route('users', function() {
        this.route('invite');
      });
      this.route('billing');
      this.route('usage');
      this.route('integrations', function() {
        this.route('okta');
        this.route('bitbucket-cloud');
        this.route('github-enterprise');
        this.route('github');
        this.route('gitlab');
        this.route('gitlab-self-hosted');
        this.route('slack', {}, function() {
          this.route('slack-config', {
            path: '/:slack_integration_id/configs/:slack_integration_config_id',
          });
        });
      });
      this.route('setup', {}, function() {
        this.route('slack-integration');
        this.route('bitbucket-cloud-integration');
      });
    });
  });
  this.route('organization', {path: '/:organization_id'}, function() {
    // Don't add anything else in this top-level namespace, we want to allow users to own the whole
    // projects namespace. Org-level settings and such should go in the above "organizations" route.
    this.route('index', {path: '/'});
    this.route('project', {path: '/:project_id'}, function() {
      this.route('settings', {}, function() {});
      this.route('integrations', {}, function() {
        this.route('webhooks', {}, function() {
          this.route('webhook-config', {path: '/:webhook_config_id'});
        });
      });
      this.route('builds', {}, function() {
        this.route('build', {path: '/:build_id'}, function() {
          this.route('snapshot', {path: '/view/:snapshot_id/:width'});
        });
        this.route('default-comparison', {path: 'snapshot/:snapshot_id/default-comparison'});
      });
    });
  });
});

export default Router;
