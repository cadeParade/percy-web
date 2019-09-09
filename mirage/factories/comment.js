import {Factory, association} from 'ember-cli-mirage';
import faker from 'faker';
import moment from 'moment';

export default Factory.extend({
  body: () => faker.hacker.phrase(),
  author: association(),
  createdAt: () => moment().subtract(22, 'hours'),
  commentThread: association(),
});
