import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import {belongsTo} from 'ember-data/relationships';

export default class CustomerQuote extends Contentful {
  get contentType() {
    return 'customerQuote';
  }

  @attr()
  customerName;

  @attr()
  customerQuote;

  @attr()
  quoteAttribution;

  @belongsTo('contentful-asset')
  headshot; // model here: https://bit.ly/2MoN7fD

  @belongsTo('contentful-asset')
  logo; // model here: https://bit.ly/2MoN7fD

  @attr()
  type;
}
