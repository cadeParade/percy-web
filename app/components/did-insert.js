import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  fire() {},
  didInsertElement() {
    this._super(...arguments);
    this.fire();
  },
});
