import Model, {attr, belongsTo} from '@ember-data/model';

export default class GithubIntegrationRequest extends Model {
  @attr()
  state;

  @belongsTo('user', {async: false})
  createdBy;
}
