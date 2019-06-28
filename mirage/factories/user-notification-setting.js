import {Factory, trait, association} from 'ember-cli-mirage';

export default Factory.extend({
  user: association(),
  notificationTypes: () => ['comment_created_email'],

  withAllCommentEmails: trait({
    notificationTypes: () => ['comment_created_email', 'comment_mention_created_email'],
  }),

  withNoCommentEmails: trait({
    notificationTypes: () => [],
  }),
});
