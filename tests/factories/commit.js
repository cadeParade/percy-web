import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';

FactoryGuy.define('commit', {
  default: {
    authorName: () => faker.name.findName(),
    sha: '01cb4be6f5dc5a3d19d57bbf840328fd0eb3a01f',
    shaShort: '01cb4be',
    message: () => faker.lorem.sentence(5),
  },
  traits: {
    longMessage: {message: () => faker.lorem.sentence(30)},
    noSpacesMessage: {message: () => faker.lorem.slug},
  },
});
