import Component from '@ember/component';
import ResourceDocs from 'percy-web/lib/docs-lookup-object';
import {computed} from '@ember/object';
import {isEmpty} from '@ember/utils';

export default Component.extend({
  tagName: '',
  selectedLanguage: 'javascript',
  selectedFramework: null,
  requestedFramework: '',

  languages: ResourceDocs,

  organization: computed.readOnly('project.organization'),
  isOtherSelected: computed.equal('selectedFramework', 'other'),

  frameworkOptions: computed('selectedLanguage', function() {
    return ResourceDocs[this.get('selectedLanguage')].frameworks;
  }),

  frameworkName: computed('selectedFramework', function() {
    const frameworks = this.get('frameworkOptions');
    const currentFramework = this.get('selectedFramework');

    return frameworks[currentFramework].name;
  }),

  docLinkClasses: computed('selectedFramework', function() {
    if (!this.get('docLink')) {
      return 'hidden';
    }
  }),

  exampleLinkClasses: computed('selectedFramework', function() {
    if (!this.get('docLink') && this.get('exampleLink')) {
      return 'percy-btn-primary';
    } else if (!this.get('exampleLink')) {
      return 'hidden';
    }
  }),

  docLink: computed('selectedFramework', function() {
    const frameworks = this.get('frameworkOptions');
    const currentFramework = this.get('selectedFramework');

    return frameworks[currentFramework].docLink;
  }),

  exampleLink: computed('selectedFramework', function() {
    const frameworks = this.get('frameworkOptions');
    const currentFramework = this.get('selectedFramework');

    return frameworks[currentFramework].exampleLink;
  }),

  actions: {
    selectLanguage(languageKey) {
      const organization = this.get('organization');

      // reset the framework so other doesn't stay selected
      this.set('selectedFramework', null);
      this.set('selectedLanguage', languageKey);
      this.get('analytics').track('Language Selected', organization, {languageKey});
    },

    selectFramework(frameworkKey) {
      const organization = this.get('organization');

      this.set('selectedFramework', frameworkKey);
      this.get('analytics').track('Framework Selected', organization, {frameworkKey});
    },

    saveRequest() {
      const organization = this.get('organization');
      const frameworkName = this.get('requestedFramework').toLowerCase();

      if (!isEmpty(frameworkName)) {
        this.get('analytics').track('New SDK Requested', organization, {frameworkName});
        this.set('requestedFramework', '');
        this.set('selectedFramework', null);
      }
    },

    trackDocsVisit() {
      const organization = this.get('organization');
      const frameworkName = this.get('selectedFramework').toLowerCase();

      this.get('analytics').track('Framework Docs Visited', organization, {frameworkName});
    },

    trackDemoVisit() {
      const organization = this.get('organization');
      const frameworkName = this.get('selectedFramework').toLowerCase();

      this.get('analytics').track('Framework Demo Project Visited', organization, {frameworkName});
    },
  },
});
