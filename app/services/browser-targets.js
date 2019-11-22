import Service from '@ember/service';
import {inject as service} from '@ember/service';

export default Service.extend({
  store: service(),
  analytics: service(),

  enabledBrowserFamiliesForProject(project) {
    const projectBrowserTargets = project.projectBrowserTargets;
    const browserFamilies = projectBrowserTargets.map(projectBrowserTarget => {
      if (projectBrowserTarget && projectBrowserTarget.browserTarget) {
        return projectBrowserTarget.browserTarget.browserFamily;
      }
    });
    return browserFamilies.filter(family => !!family).uniqBy('id');
  },

  projectBrowserTargetsForFamily(project, browserFamily) {
    return project.projectBrowserTargets.filter(function(pbt) {
      return pbt.browserTarget.browserFamily.id === browserFamily.id;
    });
  },

  removeProjectBrowserTarget(projectBrowserTarget) {
    return projectBrowserTarget.destroyRecord();
  },

  async upgradeBrowserFamily(project, browserFamily) {
    const existingProjectBrowserTargetsForFamily = this.projectBrowserTargetsForFamily(
      project,
      browserFamily,
    );
    await this.addProjectBrowserTargetForFamily(browserFamily, project);
    return await Promise.all(
      existingProjectBrowserTargetsForFamily.map(pbt => {
        return this.removeProjectBrowserTarget(pbt);
      }),
    );
  },

  removeProjectBrowserTargetForFamily(browserFamilyToRemove, project) {
    const projectBrowserTargetsForFamily = this.projectBrowserTargetsForFamily(
      project,
      browserFamilyToRemove,
    );

    const destroyPromises = projectBrowserTargetsForFamily.map(projectBrowserTarget => {
      return this.removeProjectBrowserTarget(projectBrowserTarget);
    });

    return Promise.all(destroyPromises);
  },

  addProjectBrowserTargetForFamily(browserFamilyToAdd, project) {
    const newProjectBrowserTarget = this.store.createRecord('projectBrowserTarget', {
      project,
      browserFamily: browserFamilyToAdd,
    });

    return newProjectBrowserTarget.save();
  },

  callAnalytics(project, actionName, extraProps) {
    const organization = project.organization;
    const props = {
      project_id: project.id,
    };
    const allProps = Object.assign({}, extraProps, props);
    this.analytics.track(actionName, organization, allProps);
  },
});
