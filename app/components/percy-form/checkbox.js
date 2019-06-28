import Component from '@ember/component';

export default Component.extend({
  tagName: 'input',
  type: 'checkbox',
  attributeBindings: ['name', 'type', 'checked'],
  checked: false,

  // Default behavior of checkbox component. When you click the checkbox, the checked value changes.
  // This can be overwritten if an `onChange` action is passed.
  onChange(isChecked) {
    this.set('checked', isChecked);
  },

  change(e) {
    this.onChange(e.target.checked);
  },
});
