import {inject as service} from '@ember/service';
import {readOnly} from '@ember/object/computed';
import Route from '@ember/routing/route';
import localStorageProxy from 'percy-web/lib/localstorage';
import {task} from 'ember-concurrency';
import handleOptionalAuthGetError from 'percy-web/lib/handle-optionally-authenticated-fetch-error';
import {set} from '@ember/object';

export default class ProjectRoute extends Route {
  @service
  session;

  @service
  store;

  @readOnly('session.currentUser')
  currentUser;

  async beforeModel() {
    const currentUser = this.currentUser;

    try {
      // If we get a project, it is accessible to whoever's asking for it. Keep going.
      const project = await this._getProject.perform();
      set(this, '_project', project);
      return super.beforeModel(...arguments);
    } catch (e) {
      return handleOptionalAuthGetError(e, currentUser, this);
    }
  }

  model() {
    // set by beforeModel, if successful.
    return this._project;
  }

  afterModel(model) {
    let recentProjects = localStorageProxy.get('recentProjectSlugs') || {};
    recentProjects[model.get('organization.slug')] = model.get('slug');
    localStorageProxy.set('recentProjectSlugs', recentProjects);
  }

  @task(function* () {
    const projectSlug = this.paramsFor(this.routeName).project_id;
    const orgSlug = this.paramsFor('organization').organization_id;

    const preLoadedProject = this.store
      .peekAll('project')
      .filter(project => {
        const isProjectSlugEqual = project.get('slug') === projectSlug;
        const isOrgSlugEqual = project.get('organization.slug') === orgSlug;
        return isProjectSlugEqual && isOrgSlugEqual;
      })
      .get('firstObject');

    if (preLoadedProject) {
      return preLoadedProject;
    } else {
      return yield this.store.findRecord('project', `${orgSlug}/${projectSlug}`);
    }
  })
  _getProject;
}
