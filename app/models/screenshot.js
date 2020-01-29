import Model, {belongsTo} from '@ember-data/model';

export default Model.extend({
  snapshot: belongsTo('snapshot', {async: false}),
  image: belongsTo('image', {async: false, inverse: null}),
  lossyImage: belongsTo('image', {async: false, inverse: null}),
});
