import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';

export default Component.extend({
  intercom: service(),

  connectionName: '',
  newSsoProfileEmail: '',
  organizationName: '',
  provider: '',
  userEmail: '',
  svgName: computed('provider', function () {
    if (this.provider === 'Okta') {
      return 'okta-logo';
    } else {
      return 'secure';
    }
  }),

  mainText: computed('provider', function () {
    return `${this.provider} connection failed`;
  }),
  secondaryText: computed('', 'provider', function () {
    return (
      'A Percy account cannot be connected to two accounts in the same ' +
      `${this.provider} integration`
    );
  }),
  bodyText: computed('provider', 'newSsoProfileEmail', 'userEmail', function () {
    return (
      `Your attempt to connect ${this.provider} login ${this.newSsoProfileEmail} ` +
      `failed. Percy account ${this.userEmail} is already connected to another ` +
      `${this.organizationName} ${this.provider} login`
    );
  }),

  actions: {
    showSupport() {
      this.intercom.showIntercom(
        'showNewMessage',
        `Hi! I'd like help logging into my ${this.organizationName || ''} ${
          this.provider || 'SSO'
        } account, but am receiving an error regarding a conflicting login identity.`,
      );
    },
  },
});
