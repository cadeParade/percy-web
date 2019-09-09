import Service from '@ember/service';

export default function mockWebsocketService(context, stub) {
  const websocketServiceStub = Service.extend({
    subscribeToOrganization() {
      stub();
    },
  });

  context.owner.register('service:websocket', websocketServiceStub, 'websocket');
  return stub;
}
