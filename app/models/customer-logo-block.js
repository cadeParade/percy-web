import Contentful from 'ember-data-contentful/models/contentful';
import {hasMany} from '@ember-data/model';

export default class CustomerLogoBlock extends Contentful {
  get contentType() {
    return 'customerLogoBlock';
  }

  @hasMany('customer-logo')
  customerLogos;
}
