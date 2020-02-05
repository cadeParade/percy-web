import {readOnly} from '@ember/object/computed';
import Service, {inject as service} from '@ember/service';
import localStorageProxy from 'percy-web/lib/localstorage';
import {get} from '@ember/object';

export default class RedirectsService extends Service {
  @service
  session;

  @readOnly('session.currentUser')
  currentUser;

  @service
  router;

  @service
  store;

  // This method is tested via default-project-test and default-org-test
  redirectToDefaultOrganization({useMostRecentOrg = true} = {}) {
    const currentUser = this.currentUser;
    const router = this.router;
    if (!currentUser) {
      return router.replaceWith('/login');
    }

    let lastOrganizationSlug = localStorageProxy.get('lastOrganizationSlug');

    if (lastOrganizationSlug && useMostRecentOrg) {
      return router.replaceWith('organization.index', lastOrganizationSlug);
    } else {
      this.store.query('organization', {user: currentUser}).then(orgs => {
        let org = orgs.get('firstObject');
        if (org) {
          return router.replaceWith('organization.index', org.get('slug'));
        } else {
          // User has no organizations.
          return router.replaceWith('organizations.new');
        }
      });
    }
  }

  async redirectToRecentProjectForOrg(org, {goToSettings = false} = {}) {
    if (!org) {
      return this.redirectToDefaultOrganization();
    }

    const orgSlug = get(org, 'slug');
    const orgProjects = await get(org, 'projects').reload();
    const recentProjectSlugs = localStorageProxy.get('recentProjectSlugs') || {};
    const recentProjectSlug = recentProjectSlugs[orgSlug];
    const defaultProjectForOrg = this._defaultProjectForOrg(orgProjects);
    if (recentProjectSlug && orgProjects.findBy('slug', recentProjectSlug)) {
      return this._transitionToProject(orgSlug, recentProjectSlug, goToSettings);
    } else if (defaultProjectForOrg) {
      return this._transitionToProject(orgSlug, defaultProjectForOrg.get('slug'), goToSettings);
    } else {
      return this._transitionToNewProject(orgSlug);
    }
  }

  redirectToRecentLocalstorageProject() {
    const lastOrganizationSlug = localStorageProxy.get('lastOrganizationSlug');
    const recentProjectSlugs = localStorageProxy.get('recentProjectSlugs') || {};

    const recentProjectSlug = recentProjectSlugs[lastOrganizationSlug];
    if (lastOrganizationSlug && recentProjectSlug) {
      this.router.transitionTo(
        'organization.project.index',
        lastOrganizationSlug,
        recentProjectSlug,
      );
    } else {
      this.redirectToDefaultOrganization();
    }
  }

  _transitionToProject(orgSlug, projectSlug, goToSettings) {
    if (goToSettings) {
      return this.router.transitionTo('organization.project.settings', orgSlug, projectSlug);
    } else {
      return this.router.transitionTo('organization.project.index', orgSlug, projectSlug);
    }
  }

  _transitionToNewProject(orgSlug) {
    return this.router.transitionTo('organizations.organization.projects.new', orgSlug);
  }

  _defaultProjectForOrg(orgProjects) {
    const length = get(orgProjects, 'length');
    // There are no projects
    if (length === 0) return false;

    const filteredProjects = orgProjects.filter(project => {
      // A project might not have an id if it is new and unsaved (as on the new project screen).
      const projectHasId = !!get(project, 'id');
      const isProjectEnabled = get(project, 'isEnabled');

      return projectHasId && isProjectEnabled;
    });
    return get(filteredProjects, 'firstObject');
  }
}
