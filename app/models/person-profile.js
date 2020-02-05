import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import {belongsTo, hasMany} from 'ember-data/relationships';

export default class PersonProfile extends Contentful {
  get contentType() {
    return 'person-profile';
  }

  @attr()
  name;

  @attr()
  title;

  @belongsTo('contentful-asset')
  img; // model here: https://bit.ly/2MoN7fD

  @hasMany('icon-link')
  iconLinks;

  @attr()
  labels;
}
