import {Factory} from 'ember-cli-mirage';

export default Factory.extend({
  name(i) {
    return `Repo That Gets Lots of Commits From a Large Team ${i}`;
  },

  slug(i) {
    return `Repo-${i}-slug`;
  },
});
