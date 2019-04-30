// this is a master lookup object used to create the resources widgets
// in the empty state of the project container

export default {
  javascript: {
    name: 'Javascript',
    frameworks: {
      ember: {
        name: 'Ember',
        docLink: 'https://docs.percy.io/docs/ember',
        exampleLink: 'https://github.com/percy/example-ember',
      },
      react: {
        name: 'React',
        docLink: 'https://docs.percy.io/docs/storybook-for-react',
        exampleLink: 'https://github.com/percy/example-storybook-for-react',
      },
      vue: {
        name: 'Vue',
        docLink: 'https://docs.percy.io/docs/storybook-for-vue',
        exampleLink: '',
      },
      angular: {
        name: 'Angular',
        docLink: 'https://docs.percy.io/docs/storybook-for-angular',
        exampleLink: '',
      },
      webdriverio: {
        name: 'WebdriverIO',
        docLink: 'https://docs.percy.io/docs/webdriverio',
        exampleLink: 'https://github.com/percy/example-webdriverio',
      },
      cypress: {
        name: 'Cypress',
        docLink: 'https://docs.percy.io/docs/cypress',
        exampleLink: 'https://github.com/percy/example-percy-cypress',
      },
      nightmare: {
        name: 'NightmareJS',
        docLink: 'https://docs.percy.io/docs/nightmare',
        exampleLink: 'https://github.com/percy/example-percy-nightmare',
      },
      puppeteer: {
        name: 'Puppeteer',
        docLink: 'https://docs.percy.io/docs/puppeteer',
        exampleLink: 'https://github.com/percy/example-percy-puppeteer',
      },
      protractor: {
        name: 'Protractor',
        docLink: 'https://docs.percy.io/docs/protractor',
        exampleLink: 'https://github.com/percy/example-percy-protractor',
      },
      nightwatch: {
        name: 'Nightwatch',
        docLink: 'https://docs.percy.io/docs/nightwatch',
        exampleLink: 'https://github.com/percy/example-percy-nightwatch',
      },
      other: {
        name: 'Other',
        docLink: '',
        exampleLink: '',
      },
    },
  },
  ruby: {
    name: 'Ruby',
    frameworks: {
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
      other: {
        name: 'Other',
        docLink: '',
        exampleLink: '',
      },
    },
  },
  python: {
    name: 'Python',
    frameworks: {
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
  java: {
    name: 'Java',
    frameworks: {
      selenium: {
        name: 'Selenium',
        docLink: 'https://docs.percy.io/docs/java-selenium',
        exampleLink: 'https://github.com/percy/example-percy-java-selenium',
      },
    },
    other: {
      name: 'Other',
      docLink: '',
      exampleLink: '',
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
