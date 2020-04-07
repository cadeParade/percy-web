import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';

export default class IndexRoute extends Route {
  @service
  snapshotQuery;

  @service
  commentThreads;

  @service
  reviews;

  @service
  confirm;

  @service
  session;

  @service
  launchDarkly;

  model() {
    const org = this.modelFor('organization');
    const build = this.modelFor('organization.project.builds.build');
    return hash({
      build,
      isUserMember: isUserMember(this.session.currentUser, org),
    });
  }

  async afterModel(model) {
    const controller = this.controllerFor(this.routeName);
    const build = model.build;
    controller.set('build', build);

    if (build && build.get('isFinished')) {
      controller.set('isSnapshotsLoading', true);

      if (this.launchDarkly.variation('snapshot-sort-api')) {
        await controller.fetchChangedSnapshotsWithSortOrder(build);
      } else {
        this.snapshotQuery.getChangedSnapshots(build).then(() => {
          return this._initializeSnapshotOrdering();
        });
        await this.commentThreads.getCommentsForBuild(build.id);
      }
    }
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties({
      build: model.build,
      isBuildApprovable: model.isUserMember,
      isUnchangedSnapshotsVisible: false,
    });
  }

  _initializeSnapshotOrdering() {
    // this route path needs to be explicit so it will work with fullscreen snapshots.
    let controller = this.controllerFor('organization.project.builds.build.index');
    controller.initializeSnapshotOrdering();
  }

  // Do not allow route transitions while the confirm dialog is open.
  @action
  willTransition(transition) {
    if (this.confirm.showPrompt) {
      transition.abort();
    }
  }

  @action
  initializeSnapshotOrdering() {
    this._initializeSnapshotOrdering();
  }
}
