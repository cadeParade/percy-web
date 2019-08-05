import Component from '@ember/component';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import {computed} from '@ember/object';
import {equal, bool, empty} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend(EnsureStatefulLogin, {
  session: service(),

  newOrganization: null,
  userIdentities: null,

  init() {
    this._super(...arguments);
    this.organizationsForUser = this.organizationsForUser || [];
  },

  currentUser: computed.alias('session.currentUser'),
  githubIdentity: computed('userIdentities.@each.isGithubIdentity', function() {
    return this.userIdentities.findBy('isGithubIdentity');
  }),
  hasGithubIdentity: bool('githubIdentity'),
  isGithubPurchase: equal('newOrganization.billingProvider', 'github_marketplace'),

  needsGithubIdentity: computed('isGithubPurchase', 'hasGithubIdentity', function() {
    // false if not guthub purchase or github purchase without connected github account
    return this.isGithubPurchase && !this.hasGithubIdentity;
  }),

  isFirstOrganization: empty('organizationsForUser'),

  actions: {
    connectGithub() {
      this.showConnectToGithubPurchaseModal(this.githubMarketplacePlanId);
    },
  },
});
