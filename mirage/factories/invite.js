import {Factory, association} from 'ember-cli-mirage';
import moment from 'moment';

export default Factory.extend({
  email(i) {
    return `invite-${i}@domain.com`;
  },
  createdAt() {
    return moment();
  },
  expiresAt() {
    return moment().add(7, 'days');
  },
  organization: association(),
  fromUser: association('user'),
  role: 'member',
});
