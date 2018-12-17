import Component from '@ember/component';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import {computed} from '@ember/object';
import {equal, bool, empty} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend(EnsureStatefulLogin, {
  session: service(),
  organizationsForUser: [],

  newOrganization: null,
  userIdentities: null,

  currentUser: computed.alias('session.currentUser'),
  githubIdentity: computed('userIdentities.@each.isGithubIdentity', function() {
    return this.get('userIdentities').findBy('isGithubIdentity');
  }),
  hasGithubIdentity: bool('githubIdentity'),
  isGithubPurchase: equal('newOrganization.billingProvider', 'github_marketplace'),

  needsGithubIdentity: computed('isGithubPurchase', 'hasGithubIdentity', function() {
    // false if not guthub purchase or github purchase without connected github account
    return this.get('isGithubPurchase') && !this.get('hasGithubIdentity');
  }),

  isFirstOrganization: empty('organizationsForUser'),

  actions: {
    connectGithub() {
      this.showConnectToGithubPurchaseModal(this.get('githubMarketplacePlanId'));
    },
  },
});
