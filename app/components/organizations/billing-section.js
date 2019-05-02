import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  subscriptionData: service(),
  organization: null,
  currentUsageStats: null,

  subscription: readOnly('organization.subscription'),

  isUserOrgAdmin: readOnly('organization.currentUserIsAdmin'),
});
