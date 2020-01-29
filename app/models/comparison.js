import {and, equal} from '@ember/object/computed';
import {computed} from '@ember/object';
import Model, {attr, belongsTo} from '@ember-data/model';

export default Model.extend({
  state: attr(),
  width: attr('number'),

  headBuild: belongsTo('build', {async: false}),
  headSnapshot: belongsTo('snapshot', {async: true}),
  baseSnapshot: belongsTo('snapshot', {async: true}),

  // If headScreenshot is null, the comparison was removed (compared to the base build).
  headScreenshot: belongsTo('screenshot', {async: false}),
  // If baseScreenshot is null, the comparison was added and is new (compared to the base build).
  baseScreenshot: belongsTo('screenshot', {async: false}),
  diffImage: belongsTo('image', {async: false}),
  diffRatio: attr('number'),

  browser: belongsTo('browser', {async: false, inverse: false}),

  wasAdded: computed('headScreenshot', 'baseScreenshot', function() {
    return !!this.headScreenshot && !this.baseScreenshot;
  }),
  wasRemoved: computed('headScreenshot', 'baseScreenshot', function() {
    return !!this.baseScreenshot && !this.headScreenshot;
  }),
  wasCompared: and('diffImage'),

  // Comparison is guaranteed 100% different if head was added or head was removed.
  // Otherwise, rely on the diff ratio to tell us if pixels changed.
  isDifferent: computed('wasAdded', 'wasRemoved', 'isSame', function() {
    return this.wasAdded || this.wasRemoved || !this.isSame;
  }),
  isSame: equal('diffRatio', 0),
  smartDiffRatio: computed('wasAdded', 'wasRemoved', 'diffRatio', function() {
    if (this.wasAdded || this.wasRemoved) {
      // 100% changed pixels if added or removed.
      return 1;
    } else {
      return this.diffRatio;
    }
  }),
});
