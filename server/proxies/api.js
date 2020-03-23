var httpProxy = require('http-proxy');

var proxyPath = '/api';
var proxyTarget = process.env.PERCY_WEB_API_HOST || 'http://dev.percy.local:9090';

module.exports = function (app) {
  // For options, see: https://github.com/nodejitsu/node-http-proxy
  var proxyOptions = {};
  if (proxyTarget == 'https://percy.io') {
    proxyOptions = {changeOrigin: true};
  }

  var proxy = httpProxy.createProxyServer(proxyOptions);

  proxy.on('error', function (err, req) {
    console.error(err, req.url); // eslint-disable-line
  });

  // eslint-disable-next-line
  app.use(proxyPath, function(req, res, next) {
    // include root path in proxied request
    req.url = proxyPath + req.url;

    // Authenticate with a user token instead of session cookie, if given, to avoid OAuth flow.
    // This is only done for development and only when pointed at the prod API.
    if (process.env.PERCY_WEB_API_HOST && process.env.PERCY_WEB_AUTH_TOKEN) {
      req.headers['Authorization'] = 'Token token=' + process.env.PERCY_WEB_AUTH_TOKEN;
    }

    proxy.web(req, res, {target: proxyTarget});
  });
};
