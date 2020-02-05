import Contentful from 'ember-data-contentful/models/contentful';
import {attr} from '@ember-data/model';

export default class PricingTableRow extends Contentful {
  get contentType() {
    return 'pricingTableRow';
  }

  @attr()
  rowTitle;

  @attr()
  xsmallCell;

  @attr()
  smallCell;

  @attr()
  mediumCell;

  @attr()
  largeCell;

  @attr()
  classes;
}
