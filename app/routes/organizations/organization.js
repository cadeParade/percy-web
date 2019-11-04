import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  intercom: service(),
  session: service(),
  currentUser: alias('session.currentUser'),

  model(params) {
    return this.store.loadRecord('organization', params.organization_id, {
      include: 'subscription.plan',
    });
  },

  afterModel(model) {
    this.intercom.associateWithCompany(this.currentUser, model);
  },
  actions: {},
});
