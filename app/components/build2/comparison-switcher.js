import Component from '@ember/component';

export default Component.extend({
  selectedWidth: null,
  init() {
    this._super(...arguments);
    this.comparisons = this.comparisons || [];
  },
});
