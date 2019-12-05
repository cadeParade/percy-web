import Component from '@ember/component';

export default Component.extend({
  tagName: 'input',
  type: 'radio',
  attributeBindings: ['name', 'type', 'checked', 'value'],

  onChange() {},

  change(e) {
    this.onChange(e.target.value);
  },
});
