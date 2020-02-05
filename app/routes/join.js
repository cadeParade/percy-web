import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class JoinRoute extends Route.extend(AuthenticatedRouteMixin) {
  model(params) {
    return this.store.findRecord('invite', params.invite_code);
  }
}
