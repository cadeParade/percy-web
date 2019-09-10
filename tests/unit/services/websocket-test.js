/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {it, describe, beforeEach, afterEach} from 'mocha';
import {setupTest} from 'ember-mocha';
import {make} from 'ember-data-factory-guy';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import SetupLocalStorageSandbox from 'percy-web/tests/helpers/setup-localstorage-sandbox';
import sinon from 'sinon';
import {PusherMock} from 'pusher-js-mock';

describe('WebsocketService', function() {
  setupTest();
  SetupLocalStorageSandbox();

  describe('subscribeToOrganization', function() {
    let subject;
    let organization;
    let pusherMock;
    let subscribeStub;
    let bindEventsStub;

    beforeEach(function() {
      subject = this.owner.lookup('service:websocket');
      setupFactoryGuy(this);

      organization = make('organization');
      pusherMock = new PusherMock();
      subject.set('_socket', pusherMock);
      subscribeStub = sinon.stub(pusherMock, 'subscribe').returns({});
      bindEventsStub = sinon.stub(subject, '_bindEvents');
    });

    afterEach(function() {
      pusherMock.subscribe.restore();
      subject._bindEvents.restore();
    });

    it('subscribes if not yet subscribed', function() {
      sinon.stub(subject, '_isSubscribed').returns(false);

      subject.subscribeToOrganization(organization);

      expect(subscribeStub).to.have.been.calledOnce;
      expect(bindEventsStub).to.have.been.calledOnce;
    });

    it('does not subscribe if already subscribed', function() {
      sinon.stub(subject, '_isSubscribed').returns(true);

      subject.subscribeToOrganization(organization);

      expect(subscribeStub).to.not.have.been.called;
      expect(bindEventsStub).to.not.have.been.called;
    });

    it('does not subscribe if _socket returns null', function() {
      sinon.stub(subject, '_socket').returns(null);

      subject.subscribeToOrganization(organization);

      expect(subscribeStub).to.not.have.been.called;
      expect(bindEventsStub).to.not.have.been.called;
    });
  });

  describe('_socket', function() {
    let subject;

    beforeEach(function() {
      subject = this.owner.lookup('service:websocket');
      setupFactoryGuy(this);
    });

    it('returns an instance if one already exists', function() {
      const existingSocket = 'some placeholder value for an EXISTING socket object';
      subject.set('_socket_instance', existingSocket);

      expect(subject._socket).to.eq(existingSocket);
    });

    it('creates an instance if one does not exist', function() {
      const pusherMock = new PusherMock();
      subject.set('_socket', pusherMock);
      subject.set('_socket_instance', null);

      expect(subject._socket).to.be.an.instanceof(PusherMock);
    });
  });
});
