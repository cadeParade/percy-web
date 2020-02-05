import {computed} from '@ember/object';
import Model, {attr} from '@ember-data/model';

export default class Commit extends Model {
  @attr()
  sha;

  @computed('sha')
  get shaShort() {
    var sha = this.sha;
    return sha && sha.slice(0, 7);
  }

  @attr()
  message;

  @attr()
  authorName;
}
