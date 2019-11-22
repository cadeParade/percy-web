import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('project-browser-target', {
  default: {
    project: FactoryGuy.belongsTo('project'),
    browserTarget: FactoryGuy.belongsTo('browser-target'),
    isUpgradeable: false,
  },
  traits: {
    upgradeable: {isUpgradeable: true},
  },
});
