import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';
import {task} from 'ember-concurrency';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    const project = this.modelFor('organization.project');
    const organization = this.modelFor('organization');
    const users = this._getOrgUsers.perform(organization);

    return hash({
      project,
      organization,
      users,
    });
  },

  _getOrgUsers: task(function*(organization) {
    const orgUsersRef = organization.hasMany('organizationUsers');
    let orgUsers = yield orgUsersRef.load();
    return orgUsers.mapBy('user');
  }),
});
