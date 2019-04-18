import Component from '@ember/component';
import {computed, get, set} from '@ember/object';
import {or, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

const EXTRA_FEATURES = ['Dynamic concurrent renderers', 'Unlimited projects'];
const ESSENTIAL_PLAN_SLIDER_SETUP = {
  maxRange: 150000, // This is how many snapshots it takes to get slightly over $849
  step: 5000, // arbitrary
};

// Slider settings
// There are two numbers the snapshot count is calculated from:
// The initial count, which is the numDiff property of essential plan
// and _sliderSnapshotCount which is set when the slider is moved.
// After the slider is moved, `initialSnapshotCount` is not used anymore
// since `_sliderSnapshotCount` is populated.
// These two numbers are compiled in `displaySnapshotCount` which is the number
// that should be displayed in the UI.
// `displaySnapshotCount` is also the number that the price is calculated from.
export default Component.extend({
  subscriptionData: service(),

  attributeBindings: ['data-test-pricing-card-block'],
  'data-test-pricing-card-block': true,

  essentialPlanSliderSetup: ESSENTIAL_PLAN_SLIDER_SETUP,

  _sliderSnapshotCount: null,

  displaySnapshotCount: or('_sliderSnapshotCount', 'initialSnapshotCount'),
  initialSnapshotCount: readOnly('essentialPlan.numDiffs'),

  essentialPlan: computed('subscriptionData', function() {
    return this._getPlanAndAddFeatures('Essential');
  }),

  businessPlan: computed('subscriptionData', function() {
    return this._getPlanAndAddFeatures('Business');
  }),

  _getPlanAndAddFeatures(planName) {
    const plan = get(this, 'subscriptionData.PLANS').findBy('name', planName);
    const features = [get(plan, 'numTeamMembersTitle')].concat(EXTRA_FEATURES);
    set(plan, 'features', features);
    return plan;
  },

  sliderCalculatedPrice: computed('displaySnapshotCount', function() {
    return _calculatePrice({
      basePrice: get(this, 'essentialPlan.monthlyPrice'),
      baseSnapshots: get(this, 'essentialPlan.numDiffs'),
      snapshotCount: get(this, 'displaySnapshotCount'),
      extraDiffPrice: get(this, 'essentialPlan.extraDiffPrice'),
    });
  }),

  priceText: computed('sliderCalculatedPrice', 'essentialPlan.monthlyPrice', function() {
    const price = get(this, 'sliderCalculatedPrice');
    if (price <= get(this, 'essentialPlan.monthlyPrice')) {
      return 'Starting at';
    } else {
      return 'Your price';
    }
  }),

  actions: {
    handleSliderMoved(snapshotCount) {
      this.set('_sliderSnapshotCount', snapshotCount);
    },
  },
});

function _calculatePrice({basePrice, baseSnapshots, snapshotCount, extraDiffPrice} = {}) {
  let price = basePrice;
  if (snapshotCount > baseSnapshots) {
    const extraSnapshots = snapshotCount - baseSnapshots;
    const extraSnapshotPrice = extraSnapshots * extraDiffPrice;
    price = price + extraSnapshotPrice;
  }
  return price;
}
