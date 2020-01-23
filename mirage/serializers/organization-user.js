import {JSONAPISerializer} from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  include: Object.freeze(['organization', 'user']),
  shouldIncludeLinkageData(relationshipKey) {
    if (relationshipKey === 'organization' || relationshipKey === 'user') {
      return true;
    }

    return false;
  },
});
