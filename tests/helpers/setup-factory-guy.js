import seedFaker from 'percy-web/tests/helpers/seed-faker';
import {manualSetup} from 'ember-data-factory-guy';
import freezeMoment from 'percy-web/tests/helpers/freeze-moment';

export default function setupFactoryGuy(container) {
  seedFaker();
  manualSetup(container);
  freezeMoment('2018-12-17');
}
