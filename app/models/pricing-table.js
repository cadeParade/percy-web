import Contentful from 'ember-data-contentful/models/contentful';
import {hasMany} from '@ember-data/model';

export default Contentful.extend({
  contentType: 'pricingTable',

  pricingTableRows: hasMany('pricing-table-row'),
});
