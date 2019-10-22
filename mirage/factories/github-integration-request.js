import {Factory, trait} from 'ember-cli-mirage';

export default Factory.extend({
  state: 'installable',

  requested: trait({
    state: 'requested',
  }),
});
