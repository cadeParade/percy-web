import Model, {attr, hasMany} from '@ember-data/model';

export default class BrowserFamily extends Model {
  @hasMany('browser', {async: false})
  browsers;

  @attr()
  name;

  @attr()
  slug;
}
