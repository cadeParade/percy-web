import {Factory} from 'ember-cli-mirage';
import moment from 'moment';

export default Factory.extend({
  role: 'member',
  createdAt() {
    return moment();
  },
});
