import {computed, get} from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  changeset: null,
  title: null,
  property: null,
  testLabel: null,
  isDisabled: false,
  validateProperty: () => {}, // this empty function allows validateProperty action to be optional.

  // This "value" is what the changeset property value will be set to when checked.
  // To check the checkbox by default, set the changeset's property value to the same as this value.
  checkedValue: null,
  uncheckedValue: null,

  shouldBeChecked: computed('changeset.isPristine', 'checkedValue', function() {
    return this.get('changeset.' + this.get('property')) === this.get('checkedValue');
  }),

  fieldErrors: computed('changeset.error', function() {
    return get(this.get('changeset.error'), this.get('property'));
  }),
  actions: {
    updateValue(event) {
      if (!this.get('isDisabled')) {
        if (event.target.checked) {
          this.set(`changeset.${this.get('property')}`, this.get('checkedValue'));
        } else {
          this.set(`changeset.${this.get('property')}`, this.get('uncheckedValue'));
        }
      }
    },
  },
});
