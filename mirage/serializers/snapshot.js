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
    // Builds are not fully included by API, but it does send the resource linkage info,
    // and this is the best way to mimick that in Mirage for now.
    'build',
  ]),

  links(snapshot) {
    return {
      latestChangedAncestor: {
        related: `/api/v1/snapshots/${snapshot.id}/latest-changed-ancestor`,
      },
    };
  },
});
