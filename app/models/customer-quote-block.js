import Contentful from 'ember-data-contentful/models/contentful';
import {hasMany} from 'ember-data/relationships';

export default class CustomerQuoteBlock extends Contentful {
  get contentType() {
    return 'customerQuoteBlock';
  }

  @hasMany('customer-quote')
  customerQuotes;
}
