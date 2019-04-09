import Route from '@ember/routing/route';
import $ from 'jquery';
import utils from 'percy-web/lib/utils';

export default Route.extend({
  queryParams: {
    code: '',
  },
  model(params) {
    // Since this turns the current URL (a GET request) into a PATCH request, it is a potential path
    // for CSRF attacks. Filter out any non-word characters to prevent this.
    const validatedCode = params.code.match(/\w+/).toString();
    return $.ajax({type: 'PATCH', url: utils.buildApiUrl('emailVerifications', validatedCode)}) // eslint-disable-line
      .then(() => {
        return {success: true};
      })
      .catch(e => {
        try {
          return e.responseJSON.errors[0].detail;
        } catch (_) {
          // no-op
        }
      });
  },
});
