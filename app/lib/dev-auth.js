import config from '../config/environment';

export default function () {
  return config.APP.percyWebApiHost && config.APP.percyWebAuthToken;
}
