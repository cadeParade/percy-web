import {computed, get} from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  changeset: null,
  title: null,
  subtitle: null,
  hint: null,
  property: null,
  type: 'text',
  autofocus: false,
  autocomplete: null,
  classes: null,
  disabled: false,
  testLabel: null,

  classNames: ['FormFieldsInput'],
  classNameBindings: ['classes'],

  fieldErrors: computed('changeset.error', function() {
    return get(this.get('changeset.error'), this.property);
  }),

  didUpdateAttrs() {
    // if autofocus changes and is true then the input needs to be manually focused
    if (this.autofocus) {
      document.getElementsByClassName('form-control')[0].focus();
    }
  },
});
