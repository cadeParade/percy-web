import DS from 'ember-data';
import {computed} from '@ember/object';
import moment from 'moment';

export default DS.Model.extend({
  cardBrand: DS.attr('string'),
  cardLast4: DS.attr('string'),
  cardExpiresAt: DS.attr('date'),
  isCard: DS.attr('boolean'),

  displayLabel: computed('cardBrand', 'cardExpiresAt', 'cardLast4', function() {
    const formattedDate = moment().format('M/YY');
    return `${this.cardBrand} expires ${formattedDate}. Ending in ${this.cardLast4}`;
  }),
});
