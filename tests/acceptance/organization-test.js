import setupAcceptance, {
  setupSession,
  renderAdapterErrorsAsPage,
} from '../helpers/setup-acceptance';
import freezeMoment from '../helpers/freeze-moment';
import AdminMode from 'percy-web/lib/admin-mode';
import {beforeEach, afterEach} from 'mocha';
import moment from 'moment';
import sinon from 'sinon';
import {visit, click, currentRouteName, fillIn, find, findAll} from '@ember/test-helpers';
import ProjectPage from 'percy-web/tests/pages/project-page';
import ProjectSettingsPage from 'percy-web/tests/pages/project-settings-page';
import {percySnapshot} from 'ember-percy';
import NewOrganization from 'percy-web/tests/pages/components/new-organization';
import {withVariation} from 'ember-launch-darkly/test-support/helpers/with-variation';

describe('Acceptance: Organization', function() {
  setupAcceptance();
  freezeMoment('2020-01-30');

  describe('user is member', function() {
    setupSession(function(server) {
      let organization = server.create('organization', 'withUser');
      let project = server.create('project', {organization});
      this.organization = organization;
      this.project = project;

      withVariation(this.owner, 'new-demo-project');
    });

    it('denies billing settings', async function() {
      await ProjectPage.visitOrg({orgSlug: this.organization.slug});
      expect(currentRouteName()).to.equal('organization.project.index');

      await ProjectPage.clickProjectSettings();
      expect(currentRouteName()).to.equal('organization.project.settings');

      await ProjectSettingsPage.sideNav.clickBilling();
      expect(currentRouteName()).to.equal('organizations.organization.billing');

      await percySnapshot(this.test);
    });

    it('can create new organization and update org switcher when creating second org', async function() { // eslint-disable-line
      await ProjectPage.visitOrg({orgSlug: this.organization.slug});
      await click('[data-test-toggle-org-switcher]');
      await click('[data-test-new-org]');

      expect(currentRouteName()).to.equal('organizations.new');

      await click('[data-test-toggle-org-switcher]');
      expect(findAll('[data-test-org-switcher-item]').length).to.equal(1);

      await percySnapshot(this.test.fullTitle() + ' | new');
      await NewOrganization.organizationName('New organization');
      await NewOrganization.clickSubmitNewProject();
      expect(currentRouteName()).to.equal('organization.index');

      await click('[data-test-toggle-org-switcher]');
      expect(findAll('[data-test-org-switcher-item]').length).to.equal(2);

      await percySnapshot(this.test.fullTitle() + ' | setup');
    });

    it('can create new organization and user email when creating first org', async function() {
      // simulate the user having no organizations
      server.db.organizationUsers.remove(1);
      server.db.organizations.remove(1);
      await visit('/organizations/new/');

      await NewOrganization.organizationName('New organization');
      await NewOrganization.fillUserEmail('a@a.com');
      await percySnapshot(this.test.fullTitle());

      await NewOrganization.clickSubmitNewProject();
      expect(currentRouteName()).to.equal('organization.index');
      expect(findAll('.flash-message.flash-message-success')).to.have.length(1);
    });

    it('does not show email field after first organization is created', async function() {
      // simulate the user having no organizations
      server.db.organizationUsers.remove(1);
      server.db.organizations.remove(1);
      await visit('/organizations/new/');

      await NewOrganization.organizationName('New organization');
      await NewOrganization.fillUserEmail('a@a.com');
      await NewOrganization.clickSubmitNewProject();

      await click('[data-test-toggle-org-switcher]');
      await click('[data-test-new-org]');

      expect(currentRouteName()).to.equal('organizations.new');
      expect(NewOrganization.isOrgNameFieldVisible).to.equal(true);
      expect(NewOrganization.isUserEmailFieldVisible).to.equal(false);
    });

    describe('creating a new org with demo project', function() {
      it('redirects to demo project when project has no builds', async function() {
        await visit('/organizations/new/');
        await NewOrganization.organizationName('New organization');
        await NewOrganization.clickSubmitNewDemo();
        expect(currentRouteName()).to.equal('organization.project.index');
        await percySnapshot(this.test);
      });

      it('redirects to second build when project has at least three builds', async function() {
        // Create some builds to be on the demo project.
        // We can't make these builds ahead of time, because we don't have the new demo-project id
        // until the new demo project request is made.
        server.get('/projects/:organization_slug/:project_slug/builds', function(schema, request) {
          const demoProject = schema.projects
            .all()
            .models.findBy('slug', request.params.project_slug);
          [1, 2, 3].map(i => {
            return schema.builds.create({id: i, buildNumber: i, project: demoProject});
          });
          return schema.builds.where(build => {
            return build.projectId === demoProject.id;
          });
        });
        await visit('/organizations/new/');
        await NewOrganization.organizationName('New organization');
        await NewOrganization.clickSubmitNewDemo();
        expect(currentRouteName()).to.equal('organization.project.builds.build.index');
        await percySnapshot(this.test);
      });
    });

    it('shows support on settings page', async function() {
      window.Intercom = sinon.stub();
      await visit(`/organizations/${this.organization.slug}/settings`);

      await click('[data-test-org-settings-show-support]');
      expect(window.Intercom).to.have.been.called;
    });

    it('shows support on users page', async function() {
      window.Intercom = sinon.stub();
      await visit(`/organizations/${this.organization.slug}/users`);

      await click('[data-test-users-show-support]');
      expect(window.Intercom).to.have.been.called;
    });

    it('shows support on invites page', async function() {
      window.Intercom = sinon.stub();
      await visit(`/organizations/${this.organization.slug}/users/invite`);

      await click('[data-test-users-show-support]');
      expect(window.Intercom).to.have.been.called;
    });
  });

  describe('user is admin', function() {
    setupSession(function(server) {
      this.organization = server.create('organization', 'withAdminUser');
    });

    it('can edit organization settings', async function() {
      await visit(`/${this.organization.slug}`);
      expect(currentRouteName()).to.equal('organization.index');
      await click('[data-test-settings-link]');
      expect(currentRouteName()).to.equal('organizations.organization.settings');

      await percySnapshot(this.test);
      await renderAdapterErrorsAsPage(async () => {
        await fillIn('[data-test-form-input=org-slug]', 'invalid/slug');
        await click('[data-test-edit-org-form] [data-test-org-save-button]');
        return percySnapshot(this.test.fullTitle() + ' | Error when invalid slug');
      });

      await click('.data-test-sidenav-users');
      expect(currentRouteName()).to.equal('organizations.organization.users.index');

      await percySnapshot(this.test.fullTitle() + ' | Users settings');
      await click('.data-test-sidenav-billing');
      expect(currentRouteName()).to.equal('organizations.organization.billing');

      await percySnapshot(this.test.fullTitle() + ' | Billing settings');
    });

    it('can update billing email', async function() {
      await visit(`/organizations/${this.organization.slug}/billing`);
      expect(currentRouteName()).to.equal('organizations.organization.billing');

      await percySnapshot(this.test);
      await fillIn('[data-test-form-input=billing-email]', 'a_valid_email@gmail.com');
      await click('[data-test-billing-edit-form] [data-test-form-submit-button]');
      expect(server.schema.subscriptions.first().billingEmail).to.equal('a_valid_email@gmail.com');

      await percySnapshot(this.test.fullTitle() + ' | ok modification');
      await renderAdapterErrorsAsPage(async () => {
        await fillIn('[data-test-form-input=billing-email]', 'an invalid email@gmail.com');
        await click('[data-test-billing-edit-form] [data-test-form-submit-button]');
        expect(
          find('[data-test-billing-edit-form] .FormFieldsInput ul.Form-errors li').innerText,
        ).to.equal('Billing email is invalid');
        expect(server.schema.subscriptions.first().billingEmail).to.equal(
          'a_valid_email@gmail.com',
        );
        return percySnapshot(this.test.fullTitle() + ' | invalid modification');
      });
    });

    describe('organization is on trial plan', function() {
      setupSession(function(server) {
        server.create('subscription', 'withTrialPlan', {
          organization: this.organization,
          trialStart: moment(),
          trialEnd: moment()
            .add(14, 'days')
            .add(1, 'hour'),
        });
      });

      it('can view billing page', async function() {
        await visit(`/organizations/${this.organization.slug}/billing`);
        expect(currentRouteName()).to.equal('organizations.organization.billing');
        await percySnapshot(this.test);
      });
    });

    describe('organization is on trial expired plan', function() {
      setupSession(function(server) {
        server.create('subscription', {organization: this.organization});
      });

      it('can view billing page', async function() {
        await visit(`/organizations/${this.organization.slug}/billing`);
        expect(currentRouteName()).to.equal('organizations.organization.billing');
        await percySnapshot(this.test);
      });
    });

    describe('organization is on a standard plan', function() {
      setupSession(function(server) {
        server.create('subscription', 'withStandardPlan', {organization: this.organization});
      });

      it('can view billing page', async function() {
        await visit(`/organizations/${this.organization.slug}/billing`);
        expect(currentRouteName()).to.equal('organizations.organization.billing');
        await percySnapshot(this.test);
      });
    });

    describe('organization is on custom plan', function() {
      setupSession(function(server) {
        server.create('subscription', 'withCustomPlan', {organization: this.organization});
      });

      it('can view billing page', async function() {
        await visit(`/organizations/${this.organization.slug}/billing`);
        expect(currentRouteName()).to.equal('organizations.organization.billing');
        await percySnapshot(this.test);
      });
    });
  });

  describe('user is not member of organization but is in admin-mode', function() {
    let organization;
    setupSession(function(server) {
      organization = server.create('organization');
      server.create('project', {organization});
      server.create('user');
    });

    beforeEach(() => {
      AdminMode.setAdminMode();
    });

    afterEach(() => {
      AdminMode.clear();
    });

    it('shows billing page with warning message', async function() {
      await visit(`/organizations/${organization.slug}/billing`);
      expect(currentRouteName()).to.equal('organizations.organization.billing');
      await percySnapshot(this.test.fullTitle() + ' | setup');
    });
  });
});
