import {computed, get} from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  allOptions: null, // array of objects with keys of label, value, and description
  changeset: null,
  title: null,
  property: null,
  subtitle: null,
  labelClasses: null,
  validateProperty: () => {}, // make this an optional property

  init() {
    this._super(...arguments);
    this.allOptions = this.allOptions || {};
  },

  classNames: ['FormFieldsCheckboxSet'],

  propertyValue: computed('changeset.isPristine', function() {
    return this.get(`changeset.${this.property}`);
  }),

  fieldErrors: computed('changeset.error', function() {
    return get(this.get('changeset.error'), this.property);
  }),

  actions: {
    updateValue(event) {
      let property = `changeset.${this.property}`;
      let oldValue = this.changeset.get(this.property);
      let newValue;

      if (event.target.checked) {
        // If we're enabling the target, add it to the array
        newValue = oldValue.concat([event.target.name]);
      } else {
        // If we're disabling the target, remove it from the array
        newValue = oldValue.filter(v => v != event.target.name);
      }

      // Remove duplicates and save.
      this.set(property, [...new Set(newValue)]);
    },
  },
});
