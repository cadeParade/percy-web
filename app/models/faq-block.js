import Contentful from 'ember-data-contentful/models/contentful';
import {attr, hasMany} from '@ember-data/model';

export default class FaqBlock extends Contentful {
  get contentType() {
    return 'faqBlock';
  }

  @attr()
  title;

  @hasMany('faq')
  faqs;
}
