import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import UserSettingsPageObject from 'percy-web/tests/pages/user-settings-page';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';

describe('Acceptance: User Settings', function() {
  setupAcceptance();

  let user;
  setupSession(function(server) {
    user = server.create('user');
  });

  it('displays display preferences', async function() {
    await UserSettingsPageObject.visitDisplayPreferencesPage();
    await percySnapshot(this.test);

    await UserSettingsPageObject.displayPreferencesForm.selectDarkWebTheme();
    await percySnapshot(this.test.fullTitle() + ' with dark web theme selected');

    expect(user.reload().webTheme).to.equal('dark');
  });
});
