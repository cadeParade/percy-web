import Route from '@ember/routing/route';

export default class DeprecatedSnapshotRoute extends Route {
  queryParams = {
    comparisonMode: {as: 'mode'},
    activeBrowserFamilySlug: {as: 'browser', refreshModel: true},
  };

  redirect() {
    const params = this.paramsFor(this.routeName);
    this.transitionTo('organization.project.builds.build.snapshot', params.snapshot_id, {
      queryParams: {
        mode: params.comparisonMode,
        activeBrowserFamilySlug: params.activeBrowserFamilySlug,
        width: params.width,
      },
    });
  }
}
