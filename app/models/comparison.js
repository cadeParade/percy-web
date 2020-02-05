import {computed} from '@ember/object';
import {equal, and} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';

export default class Comparison extends Model {
  @attr()
  state;

  @attr('number')
  width;

  @belongsTo('build', {async: false})
  headBuild;

  @belongsTo('snapshot', {async: true})
  headSnapshot;

  @belongsTo('snapshot', {async: true})
  baseSnapshot;

  // If headScreenshot is null, the comparison was removed (compared to the base build).
  @belongsTo('screenshot', {async: false})
  headScreenshot;

  // If baseScreenshot is null, the comparison was added and is new (compared to the base build).
  @belongsTo('screenshot', {async: false})
  baseScreenshot;

  @belongsTo('image', {async: false})
  diffImage;

  @attr('number')
  diffRatio;

  @belongsTo('browser', {async: false, inverse: false})
  browser;

  @computed('headScreenshot', 'baseScreenshot')
  get wasAdded() {
    return !!this.headScreenshot && !this.baseScreenshot;
  }

  @computed('headScreenshot', 'baseScreenshot')
  get wasRemoved() {
    return !!this.baseScreenshot && !this.headScreenshot;
  }

  @and('diffImage')
  wasCompared;

  // Comparison is guaranteed 100% different if head was added or head was removed.
  // Otherwise, rely on the diff ratio to tell us if pixels changed.
  @computed('wasAdded', 'wasRemoved', 'isSame')
  get isDifferent() {
    return this.wasAdded || this.wasRemoved || !this.isSame;
  }

  @equal('diffRatio', 0)
  isSame;

  @computed('wasAdded', 'wasRemoved', 'diffRatio')
  get smartDiffRatio() {
    if (this.wasAdded || this.wasRemoved) {
      // 100% changed pixels if added or removed.
      return 1;
    } else {
      return this.diffRatio;
    }
  }
}
