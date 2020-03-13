import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';

export default class BuildRoute extends Route {
  @service
  reviews;

  @service
  commentThreads;

  model(params) {
    return this.store.findRecord('build', params.build_id, {reload: true});
  }
}
