import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class OrganizationRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  intercom;

  @service
  session;

  @alias('session.currentUser')
  currentUser;

  model(params) {
    return this.store.loadRecord('organization', params.organization_id, {
      include: 'subscription.plan',
    });
  }

  afterModel(model) {
    this.intercom.associateWithCompany(this.currentUser, model);
  }
}
