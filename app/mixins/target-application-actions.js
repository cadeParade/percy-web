import {isNone} from '@ember/utils';
import {getOwner} from '@ember/application';
import {computed} from '@ember/object';
import Mixin from '@ember/object/mixin';
/**
  Targets a component's actions to bubble immediately to the application controller and
  through the route hierarchy, skipping any parent component action handlers.

  This allows us to avoid passing redundant args like:

    <my-component myAction={{action "myAction"}} myOtherAction={{action "myOtherAction"}}>

  ...through many layers of nested components, at the cost of highly-coupling the actions
  to the application and skipping any parent component action handlers along the way.

  This mixin should be used for simple components where this high-coupling is desirable.
*/
var TargetApplicationActionsMixin = Mixin.create({
  target: computed(function () {
    // Note: high-coupling to the container. We always return the main application controller, which
    // will trigger standard bubbling through the route hierarchy if not handled.
    return getOwner(this).lookup('controller:application');
  }),

  /**
    Override sendAction to set myAction="myAction" on the object before triggering the action
    if not specified explicitly on the component. This guarantees that the event will bubble
    to the application controller always, rather than being swallowed by the component (since
    components don't bubble actions by default if the action is not bound to an external action).
  */
  send(action) {
    var actionName = this.get(action);
    if (isNone(actionName)) {
      this.set(action, action);
    }
    return this._super.apply(this, arguments); // Pass through all original arguments.
  },
});

export default TargetApplicationActionsMixin;
