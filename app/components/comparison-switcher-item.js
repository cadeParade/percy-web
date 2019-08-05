import {computed} from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  selectedWidth: null,
  width: null,
  tagName: 'button',
  classNames: ['btn'],
  classNameBindings: [
    'isSelected:is-active:',
    'matchingComparison::is-disabled',
    'matchingComparison.isDifferent:has-diffs',
  ],

  init() {
    this._super(...arguments);
    this.comparisons = this.comparisons || [];
  },

  matchingComparison: computed('comparisons', 'width', function() {
    let comparisons = this.comparisons || [];
    return comparisons.findBy('width', this.width);
  }),

  isSelected: computed('selectedWidth', 'width', function() {
    return parseInt(this.selectedWidth, 10) === this.width;
  }),

  click() {
    this.updateSelectedWidth(this.width);
  },
});
