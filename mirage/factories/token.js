import {Factory} from 'ember-cli-mirage';

export default Factory.extend({
  token: 'abc',
  role: 'write_only',
  is_active: true,
});
