import Service, {inject as service} from '@ember/service';
import localStorageProxy from 'percy-web/lib/localstorage';
import {readOnly} from '@ember/object/computed';
import {get} from '@ember/object';

export default Service.extend({
  session: service(),
  currentUser: readOnly('session.currentUser'),
  router: service(),
  store: service(),

  // This method is tested via most-recent-org-test and default-org-test
  redirectToDefaultOrganization({useMostRecentOrg = true} = {}) {
    const currentUser = this.get('currentUser');
    const router = this.get('router');
    if (!currentUser) {
      return router.replaceWith('/login');
    }

    let lastOrganizationSlug = localStorageProxy.get('lastOrganizationSlug');

    if (lastOrganizationSlug && useMostRecentOrg) {
      return router.replaceWith('organization.index', lastOrganizationSlug);
    } else {
      this.get('store')
        .query('organization', {user: currentUser})
        .then(orgs => {
          let org = orgs.get('firstObject');
          if (org) {
            return router.replaceWith('organization.index', org.get('slug'));
          } else {
            // User has no organizations.
            return router.replaceWith('organizations.new');
          }
        });
    }
  },

  async redirectToRecentProjectForOrg(org) {
    if (!org) {
      return this.redirectToDefaultOrganization();
    }

    const orgSlug = get(org, 'slug');
    const orgProjects = await get(org, 'projects').reload();
    const recentProjectSlugs = localStorageProxy.get('recentProjectSlugs') || {};
    const recentProjectSlug = recentProjectSlugs[orgSlug];
    const defaultProjectForOrg = this._defaultProjectForOrg(orgProjects);
    if (recentProjectSlug && orgProjects.findBy('slug', recentProjectSlug)) {
      return this._transitionToProject(orgSlug, recentProjectSlug);
    } else if (defaultProjectForOrg) {
      return this._transitionToProject(orgSlug, defaultProjectForOrg.get('slug'));
    } else {
      return this._transitionToNewProject(orgSlug);
    }
  },

  _transitionToProject(orgSlug, projectSlug) {
    return this.get('router').transitionTo('organization.project.index', orgSlug, projectSlug);
  },

  _transitionToNewProject(orgSlug) {
    return this.get('router').transitionTo('organizations.organization.projects.new', orgSlug);
  },

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
  },
});
