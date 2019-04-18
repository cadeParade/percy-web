import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';

FactoryGuy.define('slack-integration', {
  default: {
    organization: FactoryGuy.belongsTo('organization'),
    teamName: () => faker.company.companyName(),
    channelName: () => `#${faker.lorem.slug()}`,
  },
});
