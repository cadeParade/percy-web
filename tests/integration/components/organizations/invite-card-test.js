import {describe, it, beforeEach, afterEach} from 'mocha';
import freezeMoment from 'percy-web/tests/helpers/freeze-moment';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import InviteCard from 'percy-web/tests/pages/components/organizations/invite-card';
import {make} from 'ember-data-factory-guy';
import moment from 'moment';
import Service from '@ember/service';
import utils from 'percy-web/lib/utils';
import {resolve} from 'rsvp';
import sinon from 'sinon';
import {percySnapshot} from 'ember-percy';

describe('Integration: InviteCard', function() {
  freezeMoment('2018-12-17');

  setupRenderingTest('organizations/invite-card-test', {
    integration: true,
  });

  // model records
  let invite;
  let organization;
  let adminUser;
  let memberUser;

  // stubs
  let confirmationAlertStub;
  let destroyInviteStub;
  let findRecordStub;
  let flashMessageSuccessStub;

  beforeEach(function() {
    setupFactoryGuy(this);
    InviteCard.setContext(this);
    invite = make('invite');
    organization = make('organization');
    adminUser = make('user');
    memberUser = make('user');
    this.setProperties({
      invite,
      organization,
    });

    // stubs
    confirmationAlertStub = sinon.stub(utils, 'confirmMessage').returns(true);
    destroyInviteStub = sinon.stub(invite, 'destroyRecord').returns(resolve());
    const flashMessageService = this.owner
      .lookup('service:flash-messages')
      .registerTypes(['success']);
    flashMessageSuccessStub = sinon.stub(flashMessageService, 'success');
    const store = this.owner.lookup('service:store');
    findRecordStub = sinon.stub(store, 'findRecord');
  });

  afterEach(function() {
    confirmationAlertStub.restore();
  });

  describe('as an admin user', function() {
    beforeEach(function() {
      const sessionServiceStub = Service.extend({
        currentUser: adminUser,
      });
      this.owner.register('service:session', sessionServiceStub, 'sessionService');
      organization.set('currentUserIsAdmin', true);
    });

    it('renders with buttons enabled', async function() {
      await this.render(hbs`{{organizations/invite-card invite=invite organization=organization}}`);

      expect(InviteCard.email).to.equal(invite.email);
      expect(InviteCard.role).to.equal('Member');
      expect(InviteCard.avatarUrl).to.include('https://www.gravatar.com/avatar/');
      expect(InviteCard.inviteExpiration).to.equal(moment(invite.expiresAt).format('MMM D, Y'));
      expect(InviteCard.inviteDate).to.equal(moment(invite.createdAt).format('MMM D, Y'));
      expect(InviteCard.inviterName).to.equal(invite.fromUser.name);
      expect(InviteCard.copyUrlButton.text).to.equal('Copy invite link');
      expect(InviteCard.cancelButton.text).to.equal('Cancel');
      expect(InviteCard.copyUrlButton.isDisabled).to.equal(false);
      expect(InviteCard.cancelButton.isDisabled).to.equal(false);

      await percySnapshot(this.test);
    });

    it('"Cancel" button works', async function() {
      await this.render(hbs`{{organizations/invite-card invite=invite organization=organization}}`);

      await InviteCard.cancelButton.click();

      expect(confirmationAlertStub).to.have.been.called;
      expect(destroyInviteStub).to.have.been.called;
      expect(findRecordStub).to.have.been.calledWith('organization', organization.get('id'), {
        reload: true,
      });
      expect(flashMessageSuccessStub).to.have.been.calledWith(
        `The invitation to ${invite.email} has been cancelled`,
      );
    });
  });

  describe('as a member user', function() {
    beforeEach(function() {
      const sessionServiceStub = Service.extend({
        currentUser: memberUser,
      });
      this.owner.register('service:session', sessionServiceStub, 'sessionService');
      organization.set('currentUserIsAdmin', false);
    });

    it('renders with buttons disabled', async function() {
      await this.render(hbs`{{organizations/invite-card invite=invite organization=organization}}`);
      expect(InviteCard.email).to.equal(invite.email);
      expect(InviteCard.role).to.equal('Member');
      expect(InviteCard.avatarUrl).to.include('https://www.gravatar.com/avatar/');
      expect(InviteCard.inviteExpiration).to.equal(moment(invite.expiresAt).format('MMM D, Y'));
      expect(InviteCard.inviteDate).to.equal(moment(invite.createdAt).format('MMM D, Y'));
      expect(InviteCard.inviterName).to.equal(invite.fromUser.name);
      expect(InviteCard.copyUrlButton.text).to.equal('Copy invite link');
      expect(InviteCard.cancelButton.text).to.equal('Cancel');
      expect(InviteCard.copyUrlButton.isDisabled).to.equal(true);
      expect(InviteCard.cancelButton.isDisabled).to.equal(true);

      await percySnapshot(this.test);
    });

    it('"Cancel" button does not work', async function() {
      await this.render(hbs`{{organizations/invite-card invite=invite organization=organization}}`);

      await InviteCard.cancelButton.click();
      expect(confirmationAlertStub).to.not.have.been.called;
      expect(destroyInviteStub).to.not.have.been.called;
      expect(findRecordStub).to.not.have.been.calledWith('organization', organization.get('id'), {
        reload: true,
      });
      expect(flashMessageSuccessStub).to.not.have.been.calledWith(
        `The invitation to ${invite.email} has been cancelled`,
      );
    });
  });
});
