import Component from '@ember/component';
import {inject as service} from '@ember/service';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';

export default Component.extend(EnsureStatefulLogin, {
  session: service(),
  store: service(),
  showCreateAccount: false,
  actions: {
    accountCreated() {
      this.set('showCreateAccount', false);

      this.flashMessages.success('You may now login using this account.', {
        title: 'Email/password account created!',
      });
      this.identities.reload();
    },
    addIdentity(providerName) {
      if (providerName === 'auth0') {
        this.toggleProperty('showCreateAccount');
      } else {
        this.showConnectToServiceModal(providerName);
      }
    },
    deleteIdentity(identityId) {
      const identity = this.store.peekRecord('identity', identityId);

      let identityProvider = identity.get('provider');
      if (identityProvider === 'auth0') {
        identityProvider = 'Email/Password';
      }

      let confirmation = confirm(
        `Are you sure you want to disconnect your ${identityProvider} account?`,
      );
      if (!confirmation) {
        return;
      }

      identity
        .destroyRecord()
        .then(() => {
          this.flashMessages.success(
            `Your ${identityProvider} account has been disconnected from Percy`,
          );
        })
        .catch(() => {
          this.flashMessages.danger(
            'There was a problem disconnecting your account.' +
              ' Please try again or contact customer support.',
          );
        });
    },
  },
});
