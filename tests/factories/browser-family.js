import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('browser-family', {
  sequences: {},
  default: {
    id: '1',
    name: 'Firefox',
    slug: 'firefox',
  },
  traits: {
    firefox: {
      id: '1',
      name: 'Firefox',
      slug: 'firefox',
    },
    chrome: {
      id: '2',
      name: 'Chrome',
      slug: 'chrome',
    },
  },
});
