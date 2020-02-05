import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';

export default class Faq extends Contentful {
  get contentType() {
    return 'faq';
  }

  @attr()
  category;

  @attr()
  question;

  @attr()
  answer;

  @attr()
  page;

  @attr()
  order;
}
