import Component from '@ember/component';
import {computed} from '@ember/object';
import {equal, or} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {PLAN_DATA} from 'percy-web/services/subscription-data';

const ESSENTIAL_PLAN_SLIDER_SETUP = {
  minRange: 10000,
  maxRange: 310000,
  step: 5000,
};

const freePlan = PLAN_DATA.PLANS[0];
const smallPlan = PLAN_DATA.PLANS[1];
const mediumPlan = PLAN_DATA.PLANS[2];
const largePlan = PLAN_DATA.PLANS[3];

const planBreaks = {
  // Number of snapshots when price of next tier is cheaper
  small: {maxSnapshots: 60000},
  medium: {maxSnapshots: 160000},
  large: {maxSnapshots: 300000},
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

  sliderSetup: ESSENTIAL_PLAN_SLIDER_SETUP,

  _sliderSnapshotCount: null,

  displaySnapshotCount: or('_sliderSnapshotCount', 'sliderSetup.minRange'),

  freePlan,
  smallPlan,
  mediumPlan,
  largePlan,

  isEnterpriseSelected: equal('selectedPlanRange', 'Enterprise'),

  priceText: computed('sliderCalculatedPrice', 'selectedPlanRange', function () {
    if (this.selectedPlanRange === 'Enterprise') {
      return 'Reach out to learn more about enterprise pricing.';
    }

    return 'Your price';
  }),

  selectedPlanRange: computed('displaySnapshotCount', function () {
    const snapshotCount = this.displaySnapshotCount;
    if (snapshotCount <= planBreaks.small.maxSnapshots) {
      return 'Small';
    } else if (snapshotCount <= planBreaks.medium.maxSnapshots) {
      return 'Medium';
    } else if (snapshotCount <= planBreaks.large.maxSnapshots) {
      return 'Large';
    } else if (snapshotCount > planBreaks.large.maxSnapshots) {
      return 'Enterprise';
    } else {
      return '';
    }
  }),

  sliderCalculatedPrice: computed('displaySnapshotCount', function () {
    const plan = this.subscriptionData.PLANS.findBy('name', this.selectedPlanRange);
    if (plan) {
      return _calculatePrice({
        basePrice: plan.amount,
        baseSnapshots: plan.usageIncluded,
        snapshotCount: this.displaySnapshotCount,
        overageUnitCost: plan.overageUnitCost,
      });
    } else {
      return '';
    }
  }),

  actions: {
    handleSliderMoved(snapshotCount) {
      this.set('_sliderSnapshotCount', snapshotCount);
    },
  },
});

function _calculatePrice({basePrice, baseSnapshots, snapshotCount, overageUnitCost} = {}) {
  let price = basePrice;
  if (snapshotCount > baseSnapshots) {
    const extraSnapshots = snapshotCount - baseSnapshots;
    const extraSnapshotPrice = extraSnapshots * overageUnitCost;
    price = price + extraSnapshotPrice;
  }
  return price;
}
