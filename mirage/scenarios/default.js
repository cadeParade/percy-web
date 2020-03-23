import moment from 'moment';

export default function (server) {
  server.logging = true;

  let user = server.create('user', {_currentLoginInTest: true});
  let subscription = server.create('subscription', {billingEmail: 'foo@bar.com'});
  let organization = server.create('organization', {subscription});
  server.create('organizationUser', {user, organization, role: 'admin'});

  let project = server.create('project', {organization});
  let headBuild = server.create('build', {project, createdAt: moment().subtract(2, 'minutes')});
  let headSnapshot = server.create('comparison', {headBuild}).headSnapshot;
  server.create('comparison', 'mobile', {headBuild, headSnapshot});
  headSnapshot = server.create('comparison', 'gotLonger', {headBuild}).headSnapshot;
  server.create('comparison', 'mobile', 'gotLonger', {headBuild, headSnapshot});
  headSnapshot = server.create('comparison', 'gotShorter', {headBuild}).headSnapshot;
  server.create('comparison', 'mobile', 'gotShorter', {headBuild, headSnapshot});
  headSnapshot = server.create('comparison', 'wasAdded', {headBuild}).headSnapshot;
  server.create('comparison', 'mobile', 'wasAdded', {headBuild, headSnapshot});
  headSnapshot = server.create('comparison', 'wasRemoved', {headBuild}).headSnapshot;
  server.create('comparison', 'mobile', 'wasRemoved', {headBuild, headSnapshot});
  headSnapshot = server.create('comparison', 'same', {headBuild}).headSnapshot;
  server.create('comparison', 'mobile', 'same', {headBuild, headSnapshot});
}
