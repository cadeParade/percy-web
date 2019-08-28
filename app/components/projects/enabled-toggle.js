import Component from '@ember/component';

export default Component.extend({
  project: null,
  classes: null,

  classNames: ['ProjectsEnabledToggle'],
  classNameBindings: ['classes'],
  actions: {
    enable() {
      let project = this.project;
      project.set('isEnabled', true);
      project.save();
    },
    disable() {
      let project = this.project;
      project.set('isEnabled', false);
      project.save();
    },
  },
});
