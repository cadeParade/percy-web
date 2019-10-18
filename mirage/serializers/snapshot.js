import {JSONAPISerializer} from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  include: Object.freeze([
    'comparisons',
    'comparisons.baseScreenshot',
    'comparisons.baseScreenshot.image',
    'comparisons.baseScreenshot.lossyImage',
    'comparisons.headScreenshot',
    'comparisons.headScreenshot.image',
    'comparisons.headScreenshot.lossyImage',
    'comparisons.baseSnapshot',
    'comparisons.headSnapshot',
    'comparisons.diffImage',
    'commentThreads.comments',
  ]),

  links(snapshot) {
    return {
      latestChangedAncestor: {
        related: `/api/v1/snapshots/${snapshot.id}/latest-changed-ancestor`,
      },
    };
  },

  shouldIncludeLinkageData(relationshipKey) {
    if (relationshipKey === 'build') {
      return true;
    }
  },
});
