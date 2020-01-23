import Service, {inject as service} from '@ember/service';

export default Service.extend({
  store: service(),
  getCommentsForBuild(buildId) {
    return this.store.query('commentThread', {
      filter: {
        build: buildId,
      },
      include: 'comments,comments.author',
    });
  },

  getCommentsForSnapshots(snapshots) {
    return this.store.query('commentThread', {
      filter: {
        build: snapshots.firstObject.build.get('id'),
        snapshot_ids: [snapshots.mapBy('id')],
      },
      include: 'comments,comments.author',
    });
  },
});
