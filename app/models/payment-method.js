import {computed} from '@ember/object';
import Model, {attr} from '@ember-data/model';
import moment from 'moment';

export default class PaymentMethod extends Model {
  @attr('string')
  cardBrand;

  @attr('string')
  cardLast4;

  @attr('date')
  cardExpiresAt;

  @attr('boolean')
  isCard;

  @computed('cardBrand', 'cardExpiresAt', 'cardLast4')
  get displayLabel() {
    const formattedDate = moment.utc(this.cardExpiresAt).format('M/YY');
    return `${this.cardBrand} expires ${formattedDate}. Ending in ${this.cardLast4}`;
  }
}
