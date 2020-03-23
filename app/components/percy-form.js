import Component from '@ember/component';
import {task, all, timeout} from 'ember-concurrency';
import {MIN_FEEDBACK_DELAY_MS} from 'percy-web/lib/min-feedback-delay-ms';

export default Component.extend({
  tagName: 'form',
  classNames: ['Form'],

  onSubmit() {},

  submit(event) {
    event.preventDefault();
    this.submitTask.perform();
  },

  submitTask: task(function* () {
    // This tells the task to wait at least 500ms for the task to complete, even if the actual
    // action finishes sooner so the user has a nice indicator that the form is doing something.
    yield all([timeout(MIN_FEEDBACK_DELAY_MS), this.onSubmit()]);
  }),
});
