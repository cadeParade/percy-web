import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  // Fetch in afterModel so we can render a loading template while we wait
  afterModel() {
    this.fetch_demo_project();
  },

  async fetch_demo_project() {
    const organization = this.modelFor('organizations.organization');
    const demoProject = this.get('store').createRecord('project', {organization, isDemo: true});
    await demoProject.save();
    const builds = await demoProject.get('builds');
    if (builds.get('length') > 2) {
      const secondBuild = builds.findBy('buildNumber', 2);
      this.transitionTo(
        'organization.project.builds.build',
        organization.get('slug'),
        demoProject.get('slug'),
        secondBuild.get('id'),
      );
    } else {
      this.transitionTo('organization.project', organization.get('slug'), demoProject.get('slug'));
    }
  },
});
