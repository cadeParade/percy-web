import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import {belongsTo} from 'ember-data/relationships';

export default class ChangelogPost extends Contentful {
  get contentType() {
    return 'changelogPost';
  }

  @attr('string')
  title;

  @attr('string')
  slug;

  @attr('date')
  date;

  @attr('string')
  tag;

  @belongsTo('contentful-asset')
  image; // model here: https://bit.ly/2MoN7fD

  @attr('string')
  content;
}
