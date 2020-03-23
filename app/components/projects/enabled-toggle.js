import Component from '@ember/component';
import {task} from 'ember-concurrency';

export default Component.extend({
  project: null,

  toggleArchiveState: task(function* () {
    const newState = !this.project.isEnabled;
    this.project.set('isEnabled', newState);
    yield this.project.save();
  }),
});
