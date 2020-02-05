import Contentful from 'ember-data-contentful/models/contentful';
import {hasMany} from '@ember-data/model';

export default class PricingTable extends Contentful {
  get contentType() {
    return 'pricingTable';
  }

  @hasMany('pricing-table-row')
  pricingTableRows;
}
