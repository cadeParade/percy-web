import FactoryGuy from 'ember-data-factory-guy';
import moment from 'moment';
import faker from 'faker';

FactoryGuy.define('comment', {
  default: {
    body: () => faker.hacker.phrase(),
    author: FactoryGuy.belongsTo('user'),
    createdAt: () => moment().subtract(22, 'hours'),
    commentThread: FactoryGuy.belongsTo('comment-thread'),
  },
  traits: {
    fromReviewThread: {
      commentThread: FactoryGuy.belongsTo('comment-thread', 'review'),
    },

    fromNoteThread: {
      commentThread: FactoryGuy.belongsTo('comment-thread', 'note'),
    },

    fromResolvedThread: {
      commentThread: FactoryGuy.belongsTo('comment-thread', 'review', 'closed'),
    },

    fromArchivedThread: {
      commentThread: FactoryGuy.belongsTo('comment-thread', 'note', 'closed'),
    },
  },
});
