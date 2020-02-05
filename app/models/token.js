import Model, {attr, belongsTo} from '@ember-data/model';

export default class Token extends Model {
  @attr()
  token;

  @attr()
  role;

  @belongsTo('project', {inverse: 'tokens'})
  project;
}
