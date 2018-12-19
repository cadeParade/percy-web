import Component from '@ember/component';
import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';

export default Component.extend({
  card: null,
  color: readOnly('card.color'),

  textClasses: computed('color', function() {
    const color = this.get('color');
    return color === 'purple' ? `text-${color}-600` : `text-${color}-500`;
  }),
});
