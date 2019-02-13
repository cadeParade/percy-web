import {create, text} from 'ember-cli-page-object';
import {RangeSlider} from 'percy-web/tests/pages/components/range-slider';

const SELECTORS = {
  SCOPE: '[data-test-pricing-card-block]',
  SNAPSHOT_COUNT: '[data-test-snapshot-count]',
  CALCULATED_PRICE: '[data-test-calculated-price]',
  PRICE_TEXT: '[data-test-price-text]',
};

const PricingCardBlock = {
  scope: SELECTORS.SCOPE,

  slider: RangeSlider,
  snapshotCount: text(SELECTORS.SNAPSHOT_COUNT),
  calculatedPrice: text(SELECTORS.CALCULATED_PRICE),
  priceText: text(SELECTORS.PRICE_TEXT),
};

export default create(PricingCardBlock);
