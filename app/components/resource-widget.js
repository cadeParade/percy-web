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
    return ResourceDocs[this.selectedLanguage].frameworks;
  }),

  frameworkName: computed('selectedFramework', function() {
    const frameworks = this.frameworkOptions;
    const currentFramework = this.selectedFramework;

    return frameworks[currentFramework].name;
  }),

  docLinkClasses: computed('selectedFramework', function() {
    if (!this.docLink) {
      return 'hidden';
    }
  }),

  exampleLinkClasses: computed('selectedFramework', function() {
    if (!this.docLink && this.exampleLink) {
      return 'percy-btn-primary';
    } else if (!this.exampleLink) {
      return 'hidden';
    }
  }),

  docLink: computed('selectedFramework', function() {
    const frameworks = this.frameworkOptions;
    const currentFramework = this.selectedFramework;

    return frameworks[currentFramework].docLink;
  }),

  exampleLink: computed('selectedFramework', function() {
    const frameworks = this.frameworkOptions;
    const currentFramework = this.selectedFramework;

    return frameworks[currentFramework].exampleLink;
  }),

  actions: {
    selectLanguage(languageKey) {
      const organization = this.organization;

      // reset the framework so other doesn't stay selected
      this.set('selectedFramework', null);
      this.set('selectedLanguage', languageKey);
      this.analytics.track('Language Selected', organization, {languageKey});
    },

    selectFramework(frameworkKey) {
      const organization = this.organization;

      this.set('selectedFramework', frameworkKey);
      this.analytics.track('Framework Selected', organization, {frameworkKey});
    },

    saveRequest() {
      const organization = this.organization;
      const frameworkName = this.requestedFramework.toLowerCase();

      if (!isEmpty(frameworkName)) {
        this.analytics.track('New SDK Requested', organization, {frameworkName});
        this.set('requestedFramework', '');
        this.set('selectedFramework', null);
      }
    },

    trackDocsVisit() {
      const organization = this.organization;
      const frameworkName = this.selectedFramework.toLowerCase();

      this.analytics.track('Framework Docs Visited', organization, {frameworkName});
    },

    trackDemoVisit() {
      const organization = this.organization;
      const frameworkName = this.selectedFramework.toLowerCase();

      this.analytics.track('Framework Demo Project Visited', organization, {frameworkName});
    },
  },
});
