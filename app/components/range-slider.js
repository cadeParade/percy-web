import Component from '@ember/component';

export default Component.extend({
  value: null,
  handleSliderMoved: null,
  min: 0,
  max: 20,
  step: 5,
});
