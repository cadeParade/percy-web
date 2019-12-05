import {JSONAPISerializer} from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  include: Object.freeze(['commentThread', 'author']),

  shouldIncludeLinkageData(relationshipKey) {
    if (relationshipKey === 'snapshot') {
      return true;
    }
  },
});
