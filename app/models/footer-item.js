import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';

export default class FooterItem extends Contentful {
  get contentType() {
    return 'footerItem';
  }

  @attr()
  category;

  @attr()
  order;

  @attr()
  text;

  @attr()
  textLink;
}
