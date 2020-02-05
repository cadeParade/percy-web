import Model, {belongsTo} from '@ember-data/model';

export default class Screenshot extends Model {
  @belongsTo('snapshot', {async: false})
  snapshot;

  @belongsTo('image', {async: false, inverse: null})
  image;

  @belongsTo('image', {async: false, inverse: null})
  lossyImage;
}
