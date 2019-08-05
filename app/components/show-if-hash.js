import {computed} from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  hash: null,

  isVisible: computed('hash', function() {
    return '#' + this.hash === location.hash;
  }),
});
