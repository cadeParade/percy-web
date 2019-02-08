import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';

export default Component.extend({
  classNames: ['ProjectsRepoIntegrator'],
  classNameBindings: ['classes'],

  project: null,

  organization: readOnly('project.organization'),
});
