import Contentful from 'ember-data-contentful/models/contentful';

export default class PricingCard extends Contentful {
  get contentType() {
    return 'pricingCard';
  }
}
