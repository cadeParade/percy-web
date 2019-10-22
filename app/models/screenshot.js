import DS from 'ember-data';

export default DS.Model.extend({
  snapshot: DS.belongsTo('snapshot', {async: false}),
  image: DS.belongsTo('image', {async: false, inverse: null}),
  lossyImage: DS.belongsTo('image', {async: false, inverse: null}),
});
