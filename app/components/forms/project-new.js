import {computed} from '@ember/object';
import BaseFormComponent from './base';
import ProjectNewValidations from '../../validations/project-new';

export default BaseFormComponent.extend({
  organization: null,
  classes: null,

  classNames: ['FormsProjectNew', 'Form'],
  classNameBindings: ['classes'],

  model: computed(function () {
    return this.store.createRecord('project', {
      organization: this.organization,
    });
  }),
  validator: ProjectNewValidations,

  willDestroyElement() {
    // Don't leave an unsaved new project model in the store.
    this.model.rollbackAttributes();
  },
});
