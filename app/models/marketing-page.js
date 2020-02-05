import Contentful from 'ember-data-contentful/models/contentful';
import {attr, hasMany} from '@ember-data/model';

export default class MarketingPage extends Contentful {
  get contentType() {
    return 'marketingPage';
  }

  @attr() pageName;

  @hasMany('block') blocks;
}
