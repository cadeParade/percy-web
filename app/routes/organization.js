import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import localStorageProxy from 'percy-web/lib/localstorage';
import {task} from 'ember-concurrency';
import handleOptionalAuthGetError from 'percy-web/lib/handle-optionally-authenticated-fetch-error';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {set} from '@ember/object';

export default class OrganizationRoute extends Route {
  @service
  intercom;

  @service
  session;

  @service
  store;

  @alias('session.currentUser')
  currentUser;

  @service
  websocket;

  async beforeModel() {
    const currentUser = this.currentUser;

    // If we get an organization, it is accessible to whoever's asking for it. Keep going.
    try {
      const org = await this._getOrganization.perform();
      set(this, '_organization', org);
      return super.beforeModel(...arguments);
    } catch (e) {
      return handleOptionalAuthGetError(e, currentUser, this);
    }
  }

  model() {
    // set by beforeModel, if successful.
    return this._organization;
  }

  afterModel(model) {
    this._setupIntercom(model);
    this._setupWebsocket(model);
    this._setLastOrganizationSlug(model);
  }

  _setupIntercom(organization) {
    if (isUserMember(this.currentUser, organization)) {
      this.intercom.associateWithCompany(this.currentUser, organization);
    }
  }

  async _setupWebsocket(organization) {
    if (isUserMember(this.currentUser, organization)) {
      this.websocket.subscribeToOrganization(organization);
    }
  }

  _setLastOrganizationSlug(organization) {
    localStorageProxy.set('lastOrganizationSlug', organization.get('slug'));
  }

  @task(function* () {
    const orgSlug = this.paramsFor(this.routeName).organization_id;
    const preloadedOrg = this.store.peekAll('organization').findBy('slug', orgSlug);
    if (preloadedOrg) {
      return preloadedOrg;
    } else {
      return yield this.store.findRecord('organization', orgSlug);
    }
  })
  _getOrganization;
}
