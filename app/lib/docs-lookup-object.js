// this is a master lookup object used to create the resources widgets
// in the empty state of the project container

export default {
  popular: {
    name: 'Popular',
    frameworks: {
      percyscript: {
        name: 'PercyScript',
        docLink: 'https://docs.percy.io/docs/percyscript',
        exampleLink: 'https://github.com/percy/example-percyscript',
      },
      cypress: {
        name: 'Cypress',
        docLink: 'https://docs.percy.io/docs/cypress',
        exampleLink: 'https://github.com/percy/example-percy-cypress',
      },
      capybara: {
        name: 'Capybara',
        docLink: 'https://docs.percy.io/docs/rails',
        exampleLink: 'https://github.com/percy/example-rails',
      },
      storybook: {
        name: 'Storybook',
        docLink: 'https://docs.percy.io/docs/storybook',
        exampleLink: '',
      },
    },
  },
  web: {
    name: 'Web',
    frameworks: {
      percyscript: {
        name: 'PercyScript',
        docLink: 'https://docs.percy.io/docs/percyscript',
        exampleLink: 'https://github.com/percy/example-percyscript',
      },
      ember: {
        name: 'Ember',
        docLink: 'https://docs.percy.io/docs/ember',
        exampleLink: 'https://github.com/percy/example-ember',
      },
      rails: {
        name: 'Rails',
        docLink: 'https://docs.percy.io/docs/rails',
        exampleLink: 'https://github.com/percy/example-rails',
      },
      capybara: {
        name: 'Capybara',
        docLink: 'https://docs.percy.io/docs/rails',
        exampleLink: 'https://github.com/percy/example-rails',
      },
      selenium: {
        name: 'Selenium',
        docLink: 'https://docs.percy.io/docs/python-selenium',
        exampleLink: 'https://github.com/percy/example-django-selenium',
      },
      other: {
        name: 'Other',
        docLink: '',
        exampleLink: '',
      },
    },
  },
  components: {
    name: 'Components',
    frameworks: {
      storybook: {
        name: 'Storybook',
        docLink: 'https://docs.percy.io/docs/storybook',
        exampleLink: '',
      },
      other: {
        name: 'Other',
        docLink: '',
        exampleLink: '',
      },
    },
  },
  e2e: {
    name: 'E2E',
    frameworks: {
      cypress: {
        name: 'Cypress',
        docLink: 'https://docs.percy.io/docs/cypress',
        exampleLink: 'https://github.com/percy/example-percy-cypress',
      },
      puppeteer: {
        name: 'Puppeteer',
        docLink: 'https://docs.percy.io/docs/puppeteer',
        exampleLink: 'https://github.com/percy/example-percy-puppeteer',
      },
      webdriverio: {
        name: 'WebdriverIO',
        docLink: 'https://docs.percy.io/docs/webdriverio',
        exampleLink: 'https://github.com/percy/example-webdriverio',
      },
      nightmare: {
        name: 'NightmareJS',
        docLink: 'https://docs.percy.io/docs/nightmare',
        exampleLink: 'https://github.com/percy/example-percy-nightmare',
      },
      nightwatch: {
        name: 'Nightwatch',
        docLink: 'https://docs.percy.io/docs/nightwatch',
        exampleLink: 'https://github.com/percy/example-percy-nightwatch',
      },
      protractor: {
        name: 'Protractor',
        docLink: 'https://docs.percy.io/docs/protractor',
        exampleLink: 'https://github.com/percy/example-percy-protractor',
      },
      selenium: {
        name: 'Selenium',
        docLink: 'https://docs.percy.io/docs/python-selenium',
        exampleLink: 'https://github.com/percy/example-django-selenium',
      },
      java: {
        name: 'Java',
        docLink: 'https://docs.percy.io/docs/java-selenium',
        exampleLink: 'https://github.com/percy/example-percy-java-selenium',
      },
      other: {
        name: 'Other',
        docLink: '',
        exampleLink: '',
      },
    },
  },
  static: {
    name: 'Static Sites',
    frameworks: {
      cli: {
        name: 'Percy CLI',
        docLink: 'https://docs.percy.io/docs/command-line-client',
        exampleLink: '',
      },
      jekyll: {
        name: 'Jekyll',
        docLink: 'https://docs.percy.io/docs/jekyll',
        exampleLink: 'https://github.com/percy/example-percy-jekyll',
      },
      other: {
        name: 'Other',
        docLink: '',
        exampleLink: '',
      },
    },
  },
  // automation: {},
  // php: {},
  // aspnet: {},
};
