import {PusherMock} from 'pusher-js-mock';
import sinon from 'sinon';

export default function mockPusher(context) {
  const websocketService = context.owner.lookup('service:websocket');
  const pusherMock = new PusherMock();
  websocketService.set('_socket', pusherMock);
  sinon.stub(websocketService, '_isSubscribed').returns(false);
  return websocketService;
}
