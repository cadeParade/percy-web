import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import {belongsTo} from 'ember-data/relationships';

export default class IconLink extends Contentful {
  get contentType() {
    return 'icon-link';
  }

  @belongsTo('contentful-asset')
  icon; // model here: https://bit.ly/2MoN7fD

  @attr()
  url;
}
