import Component from '@ember/component';
import {computed} from '@ember/object';
import {guidFor} from '@ember/object/internals';

// Use this component to wrap labels and inputs that need to share a unique id to be linked.
// Ex: in the following snippet, the group.label['for'] and group.input[id] would
// be the same so your elements are linked automatically.
//
// {{#form.group}}
//   {{#group.label}}Label for input{{#group.label}}
//   {{group.input value=value}}
// {{/form.group}}

export default Component.extend({
  tagName: '',
  uniqueId: computed(function () {
    return `${guidFor(this)}-input`;
  }),
});
