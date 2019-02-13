import {create, fillable, value} from 'ember-cli-page-object';

const SELECTORS = {
  SLIDER: '[data-test-range-slider]',
};

export const RangeSlider = {
  scope: SELECTORS.SLIDER,

  value: value(),
  setValue: fillable(),
};

export default create(RangeSlider);
