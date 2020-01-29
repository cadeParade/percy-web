import Contentful from 'ember-data-contentful/models/contentful';
import {attr, hasMany} from '@ember-data/model';

export default Contentful.extend({
  contentType: 'faqBlock',

  title: attr(),
  faqs: hasMany('faq'),
});
