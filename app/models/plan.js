import {computed} from '@ember/object';
import {and, equal, gt, not, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import DS from 'ember-data';

const SPONSORED_TYPE = 'sponsored';

export default DS.Model.extend({
  subscriptionData: service(),

  name: DS.attr(),
  interval: DS.attr(),
  intervalCount: DS.attr('number'),
  amount: DS.attr('number'),
  workerLimit: DS.attr('number'),
  usageIncluded: DS.attr('number'),
  historyLimitDays: DS.attr('number'),
  allowOverages: DS.attr('boolean'),
  overageUnitCost: DS.attr('number'),
  isTrial: DS.attr('boolean'),
  isFree: DS.attr('boolean'),
  isPaid: DS.attr('boolean'),
  type: DS.attr(),

  hasAmount: gt('amount', 0),
  isNotFree: not('isFree'),

  isStandardPlan: readOnly('_isInCurrentPlanIds'),
  isStandardAndNotFree: and('isStandardPlan', 'isNotFree'),
  isCustom: computed('id', 'isTrial', function() {
    const isTrial = this.get('isTrial');
    return !isTrial && this.get('subscriptionData.PLAN_IDS').indexOf(this.get('id')) === -1;
  }),

  isUpgradeable: computed('id', function() {
    return this.get('subscriptionData.UPGRADEABLE_PLAN_IDS').indexOf(this.get('id')) !== -1;
  }),

  isSponsored: equal('type', SPONSORED_TYPE),
  isNotSponsored: not('isSponsored'),

  _isInCurrentPlanIds: computed('id', function() {
    return this.get('subscriptionData.PLAN_IDS').indexOf(this.get('id')) > -1;
  }),
});
