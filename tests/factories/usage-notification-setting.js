import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';

FactoryGuy.define('usage-notification-setting', {
  default: {
    organization: FactoryGuy.belongsTo('organization'),
    isEnabled: true,
    emails: () => {
      return [faker.internet.email(), faker.internet.email()];
    },
    thresholds: () => {
      return {
        'snapshot-count': ['10', '200', '3000'],
      };
    },
  },
});
