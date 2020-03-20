import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';
import moment from 'moment';

FactoryGuy.define('browser-target', {
  default: {
    browserFamily: FactoryGuy.belongsTo('browser-target'),
    versionTarget: faker.random.number,
  },
  traits: {
    withChromeBrowserFamily: {
      browserFamily: FactoryGuy.belongsTo('browser-family', 'chrome'),
    },
    withFirefoxBrowserFamily: {
      browserFamily: FactoryGuy.belongsTo('browser-family', 'firefox'),
    },
    withDeprecationPeriod: {
      deprecationPeriodStart: moment().add(1, 'week'),
      deprecationPeriodEnd: moment().add(5, 'weeks'),
    },
  },
});
