import Model, {attr} from '@ember-data/model';
import {computed} from '@ember/object';
import moment from 'moment';

export default Model.extend({
  cardBrand: attr('string'),
  cardLast4: attr('string'),
  cardExpiresAt: attr('date'),
  isCard: attr('boolean'),

  displayLabel: computed('cardBrand', 'cardExpiresAt', 'cardLast4', function() {
    const formattedDate = moment.utc(this.cardExpiresAt).format('M/YY');
    return `${this.cardBrand} expires ${formattedDate}. Ending in ${this.cardLast4}`;
  }),
});
