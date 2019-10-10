import FactoryGuy from 'ember-data-factory-guy';
import moment from 'moment';
import {REVIEW_COMMENT_TYPE, NOTE_COMMENT_TYPE} from 'percy-web/models/comment-thread';
import faker from 'faker';

FactoryGuy.define('comment-thread', {
  polymorphic: false,
  default: {
    type: REVIEW_COMMENT_TYPE,
    createdAt: () => moment().subtract(22, 'hours'),
    originatingSnapshotId: () => faker.random.number(),
    originatingBuildNumber: () => faker.random.number(),
    snapshot: FactoryGuy.belongsTo('snapshot'),
  },

  traits: {
    withOneComment: {
      comments: FactoryGuy.hasMany('comment', 1),
    },
    withTwoComments: {
      comments: FactoryGuy.hasMany('comment', 2),
    },
    withTenComments: {
      comments: FactoryGuy.hasMany('comment', 10),
    },
    closed: {
      closedBy: FactoryGuy.belongsTo('user'),
      closedAt: () => moment().subtract(11, 'minutes'),
    },
    old: {
      comments: FactoryGuy.hasMany('comment', 2, {
        createdAt: () => moment().subtract(100, 'days'),
      }),
    },
    review: {
      type: REVIEW_COMMENT_TYPE,
    },
    note: {
      type: NOTE_COMMENT_TYPE,
    },

    autoReview: {
      type: REVIEW_COMMENT_TYPE,
      comments: FactoryGuy.hasMany('comment', 1, {body: ''}),
    },
  },
});
