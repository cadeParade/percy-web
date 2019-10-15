import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {gt, notEmpty} from '@ember/object/computed';

export default Component.extend({
  session: service(),
  store: service(),
  flashMessages: service(),

  allowEditingAccounts: true,

  init() {
    this._super(...arguments);
    this.identities = this.identities || [];
  },

  githubIdentity: computed('identities.@each.provider', function() {
    return this.identities.findBy('provider', 'github');
  }),
  emailPasswordIdentity: computed('identities.@each.provider', function() {
    return this.identities.findBy('provider', 'auth0');
  }),
  oktaIdentity: computed('identities.@each.provider', function() {
    return this.identities.findBy('isOktaIdentity');
  }),
  hasAnyIdentities: notEmpty('identities'),
  isDisconnectIdentityEnabled: gt('identities.length', 1),
});
