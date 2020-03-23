import {Factory, trait, association} from 'ember-cli-mirage';
import {REVIEW_COMMENT_TYPE, NOTE_COMMENT_TYPE} from 'percy-web/models/comment-thread';
import moment from 'moment';
import faker from 'faker';

export default Factory.extend({
  type: REVIEW_COMMENT_TYPE,
  createdAt: () => moment().subtract(22, 'hours').format(),
  snapshot: association(),
  originatingSnapshotId: () => faker.random.number(),
  originatingBuildNumber: () => faker.random.number(),

  withOneComment: trait({
    afterCreate(commentThread, server) {
      server.create('comment', {commentThread});
    },
  }),

  withTwoComments: trait({
    afterCreate(commentThread, server) {
      server.createList('comment', 2, {commentThread});
    },
  }),

  withTenComments: trait({
    afterCreate(commentThread, server) {
      server.createList('comment', 10, {commentThread});
    },
  }),

  note: trait({
    type: NOTE_COMMENT_TYPE,
  }),
});
