import {equal, reads} from '@ember/object/computed';
import Component from '@ember/component';

const KEYS = {
  RIGHT_ARROW: 39,
};

export default Component.extend({
  classNames: ['ComparisonViewerFull', 'w-full', 'p-2'],
  comparison: null,
  isBase: equal('comparisonMode', 'base'),
  isHead: equal('comparisonMode', 'head'),
  isDiff: equal('comparisonMode', 'diff'),
  headImage: reads('comparison.headScreenshot.image'),
  diffImage: reads('comparison.diffImage'),
  baseImage: reads('comparison.baseScreenshot.image'),
  click() {
    if (!this.get('comparison') || this.get('comparison.wasAdded')) {
      return;
    }
    this.get('cycleComparisonMode')(KEYS.RIGHT_ARROW);
  },
});
