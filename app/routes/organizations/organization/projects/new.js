import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class NewRoute extends Route.extend(AuthenticatedRouteMixin) {
  model() {
    return this.modelFor('organizations.organization');
  }

  @action
  projectCreated(project) {
    let organizationSlug = project.get('organization.slug');
    let projectSlug = project.get('slug');
    this.transitionTo('organization.project.index', organizationSlug, projectSlug);
  }
}
