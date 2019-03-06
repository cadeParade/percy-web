import Route from '@ember/routing/route';
import localStorageProxy from 'percy-web/lib/localstorage';
import {inject as service} from '@ember/service';
import {readOnly} from '@ember/object/computed';
import {task} from 'ember-concurrency';
import handleOptionalAuthGetError from 'percy-web/lib/handle-optionally-authenticated-fetch-error';

export default Route.extend({
  session: service(),
  store: service(),
  currentUser: readOnly('session.currentUser'),

  async beforeModel() {
    const currentUser = this.get('currentUser');

    try {
      // If we get a project, it is accessible to whoever's asking for it. Keep going.
      const project = await this.get('_getProject').perform();
      this.set('_project', project);
      return this._super(...arguments);
    } catch (e) {
      return handleOptionalAuthGetError(e, currentUser, this);
    }
  },

  model() {
    // set by beforeModel, if successful.
    return this.get('_project');
  },

  afterModel(model) {
    let recentProjects = localStorageProxy.get('recentProjectSlugs') || {};
    recentProjects[model.get('organization.slug')] = model.get('slug');
    localStorageProxy.set('recentProjectSlugs', recentProjects);
  },

  _getProject: task(function*() {
    const projectSlug = this.paramsFor(this.routeName).project_id;
    const orgSlug = this.paramsFor('organization').organization_id;

    const preLoadedProject = this.get('store')
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
      return yield this.get('store').findRecord('project', `${orgSlug}/${projectSlug}`);
    }
  }),
});
