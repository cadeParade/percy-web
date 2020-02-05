import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class IndexRoute extends Route.extend(AuthenticatedRouteMixin) {
  redirect() {
    let organizationSlug = this.modelFor('organization').get('slug');
    let projectSlug = this.modelFor('organization.project').get('slug');
    this.transitionTo('organization.project.index', organizationSlug, projectSlug);
  }
}
