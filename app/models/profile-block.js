import classic from 'ember-classic-decorator';
import Contentful from 'ember-data-contentful/models/contentful';
import {hasMany} from 'ember-data/relationships';

// Remove @classic when we can refactor away from mixins
@classic
export default class ProfileBlock extends Contentful {
  get contentType() {
    return 'profileBlock';
  }

  @hasMany('person-profile')
  profiles;
}
