import Component from '@ember/component';
import {alias} from '@ember/object/computed';

export default Component.extend({
  build: null,
  commit: null,
  isRepoLinked: alias('build.isRepoLinked'),
});
