import Component from '@ember/component';
import {computed} from '@ember/object';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import {inject as service} from '@ember/service';

export default Component.extend(EnsureStatefulLogin, {
  intercom: service(),

  connectionName: '',
  organizationName: '',
  provider: '',
  required: false,
  svgName: computed('provider', function() {
    if (this.provider === 'Okta') {
      return 'okta-logo';
    } else {
      return 'secure';
    }
  }),

  organizationNameWithDefault: computed('organizationName', function() {
    return this.organizationName || 'your organization';
  }),
  providerWithDefault: computed('provider', function() {
    return this.provider || 'your Single Sign-On provider';
  }),
  mainText: computed('providerWithDefault', function() {
    return `Login through ${this.providerWithDefault}`;
  }),
  secondaryText: computed(
    'required',
    'organizationNameWithDefault',
    'providerWithDefault',
    function() {
      if (this.required) {
        return (
          `${this.organizationNameWithDefault} requires you to login through ` +
          `${this.providerWithDefault}.`
        );
      }
      return `Login to ${this.organizationNameWithDefault} with ${this.providerWithDefault}.`;
    },
  ),

  actions: {
    showLoginPrompt() {
      this.showSsoLoginModal(this.connectionName || 'Username-Password-Authentication');
    },
    showSupport() {
      this.intercom.showIntercom(
        'showNewMessage',
        `Hi! I'd like help logging into my ${this.organizationName || ''} ${this.provider ||
          'SSO'} account.`,
      );
    },
  },
});
