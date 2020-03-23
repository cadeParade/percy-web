import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
  subscriptionData: service(),
  selectedPlanId: null,
  plan: computed('selectedPlanId', function () {
    return this.subscriptionData.PLANS.findBy('id', this.selectedPlanId);
  }),
});
