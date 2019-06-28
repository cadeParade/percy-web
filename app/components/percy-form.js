import Component from '@ember/component';
import {task, all, timeout} from 'ember-concurrency';

export default Component.extend({
  tagName: 'form',
  classNames: ['Form'],

  onSubmit() {},

  submit(event) {
    event.preventDefault();
    this.submitTask.perform();
  },

  submitTask: task(function*() {
    // This tells the task to wait at least 500ms for the task to complete, even if the actual
    // action finishes sooner so the user has a nice indicator that the form is doing something.
    yield all([timeout(500), this.onSubmit()]);
  }),
});
