import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import {belongsTo} from 'ember-data/relationships';

export default class SupportingContent extends Contentful {
  get contentType() {
    return 'supportingContent';
  }

  @attr()
  header;

  @attr()
  bodyText;

  @attr()
  supportingContentIcon;

  @belongsTo('contentful-asset')
  supportingContentImageIcon; // model here: https://bit.ly/2MoN7fD
}
