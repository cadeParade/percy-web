import Component from '@ember/component';
import {filterBy} from '@ember/object/computed';

export default Component.extend({
  tagName: 'aside',
  project: null,
  projects: null,
  toggleSidebar: null,

  enabledProjects: filterBy('projects', 'isEnabled', true),
  archivedProjects: filterBy('projects', 'isDisabled', true),
});
