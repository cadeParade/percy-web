import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import NotifSettings from 'percy-web/tests/pages/components/forms/user-notification-setting'; // eslint-disable-line
import {percySnapshot} from 'ember-percy';
import {findAll, settled, waitUntil} from '@ember/test-helpers';
import Response from 'ember-cli-mirage/response';

describe('Acceptance: User notification settings', function() {
  setupAcceptance();

  async function expectButtonLoadingState() {
    await waitUntil(() => !!NotifSettings.submit.isSaving);
    expect(NotifSettings.submit.isSaving).to.equal(true);
    await settled();
  }

  function dbSettingObjects() {
    return server.db.userNotificationSetting;
  }

  describe('when a user does not have a user-notification-setting', function() {
    setupSession(function(server) {
      server.create('user');
    });

    it('creates a new setting object', async function() {
      await NotifSettings.visitUserNotificationSettingsPage();
      expect(dbSettingObjects().length).to.equal(0);

      NotifSettings.options.forEach(option => expect(option.isChecked).to.equal(true));

      await NotifSettings.submit.click();
      expect(dbSettingObjects().length, 'do not fire POST when form has not changed').to.equal(0);
      await NotifSettings.commentEmailReply.click();
      expect(NotifSettings.commentEmailReply.isChecked).to.equal(false);

      NotifSettings.submit.click();
      await expectButtonLoadingState();

      expect(
        dbSettingObjects().length,
        'create a new notif-setting record when the data is dirty',
      ).to.equal(1);
      expect(dbSettingObjects()[0].notificationTypes).to.eql(['comment_mention_created_email']);
      expect(NotifSettings.commentEmailReply.isChecked).to.equal(false);
      expect(NotifSettings.commentEmailMention.isChecked).to.equal(true);

      await percySnapshot(this.test);
    });
  });

  describe('when a user has a user-notification-setting', function() {
    setupSession(function(server) {
      const user = server.create('user');
      server.create('userNotificationSetting', 'withNoCommentEmails', {user});
    });

    it('updates existing record', async function() {
      await NotifSettings.visitUserNotificationSettingsPage();
      expect(dbSettingObjects().length).to.equal(1);
      NotifSettings.options.forEach(option => expect(option.isChecked).to.equal(false));

      await NotifSettings.submit.click();
      expect(dbSettingObjects().length, 'do not fire PATCH when form has not changed').to.equal(1);

      await NotifSettings.commentEmailMention.click();
      expect(NotifSettings.commentEmailMention.isChecked).to.equal(true);

      NotifSettings.submit.click();
      await expectButtonLoadingState();

      expect(dbSettingObjects().length, 'existing record should be updated').to.equal(1);
      expect(dbSettingObjects()[0].notificationTypes).to.eql(['comment_mention_created_email']);
      expect(NotifSettings.commentEmailReply.isChecked).to.equal(false);
      expect(NotifSettings.commentEmailMention.isChecked).to.equal(true);

      await NotifSettings.commentEmailMention.click();
      await NotifSettings.submit.click();
      expect(dbSettingObjects().length, 'existing record should be updated').to.equal(1);
      expect(dbSettingObjects()[0].notificationTypes).to.eql([]);
    });
  });

  describe('when the save errors', function() {
    setupSession(function(server) {
      const user = server.create('user');
      server.create('userNotificationSetting', 'withNoCommentEmails', {user});
      server.patch('/user-notification-setting/:id', function() {
        return new Response(500);
      });
    });

    it('shows flash message and rolls form back', async function() {
      function expectOriginalState() {
        expect(NotifSettings.commentEmailReply.isChecked).to.equal(false);
        expect(NotifSettings.commentEmailMention.isChecked).to.equal(false);
      }

      await NotifSettings.visitUserNotificationSettingsPage();
      expectOriginalState();

      await NotifSettings.commentEmailMention.click();
      await NotifSettings.submit.click();
      const flashMessages = findAll('.flash-message.flash-message-danger');
      expect(flashMessages.length).to.equal(1);
      expectOriginalState();

      await NotifSettings.commentEmailMention.click();
      await NotifSettings.submit.click();
      expectOriginalState();
    });
  });
});
