import Contentful from 'ember-data-contentful/models/contentful';

export default class PricingCardBlock extends Contentful {
  get contentType() {
    return 'pricingCardBlock';
  }
}
