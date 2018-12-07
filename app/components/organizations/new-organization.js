import Component from '@ember/component';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import {computed} from '@ember/object';
import {equal, empty} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend(EnsureStatefulLogin, {
  session: service(),
  organizationsForUser: [],

  newOrganization: null,

  currentUser: computed.alias('session.currentUser'),
  githubIdentity: computed.alias('currentUser.hasGithubIdentity'),
  hasGithubIdentity: computed.alias('currentUser.hasGithubIdentity.isTruthy'),
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
