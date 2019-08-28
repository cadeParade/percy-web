import Service from '@ember/service';

export default function(context, serviceContent) {
  const serviceStub = Service.extend(serviceContent);
  context.owner.register('service:session', serviceStub, 'session');
}
