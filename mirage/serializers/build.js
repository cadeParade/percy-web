import {JSONAPISerializer} from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  include: Object.freeze(['project', 'repo', 'approvedBy', 'commit', 'baseBuild', 'browsers']),
  links(build) {
    return {
      snapshots: {
        related: `/api/v1/builds/${build.id}/snapshots`,
      },
      comparisons: {
        related: `/api/v1/builds/${build.id}/comparisons`,
      },
      removedSnapshots: {
        related: `/api/v1/builds/${build.id}/removed-snapshots`,
      },
    };
  },
});
