import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import isUserMember from 'percy-web/lib/is-user-member-of-org';

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

  async afterModel(model) {
    const controller = this.controllerFor(this.routeName);
    this.intercom.associateWithCompany(this.currentUser, model);
    const isUserMemberOfOrg = await isUserMember(this.session.currentUser, model);
    controller.setProperties({isUserMember: isUserMemberOfOrg});
  }
}
