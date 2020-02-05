import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class GithubRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  async beforeModel() {
    // If we don't force reload user on this page,
    // we don't get the associated Identities
    return await this.session.forceReloadUser();
  }
}
