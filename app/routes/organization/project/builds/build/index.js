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
      await controller.fetchChangedSnapshotsWithSortOrder(build);
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

  // Do not allow route transitions while the confirm dialog is open.
  @action
  willTransition(transition) {
    if (this.confirm.showPrompt) {
      transition.abort();
    }
  }
}
