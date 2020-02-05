import Model, {attr} from '@ember-data/model';

export default class Image extends Model {
  @attr()
  url;

  @attr('number')
  width;

  @attr('number')
  height;
}
