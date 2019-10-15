import Mixin from '@ember/object/mixin';

// From: https://github.com/emberjs/data/issues/4262#issuecomment-400911155
// This is a workaround for models being received & created by pusher
// BEFORE the POST request returns
// The POST request then also tries to create the record, but ID already exists, so it errors out.

// NOTE: When using this mixin, make sure that after you save, you remove any references
// to the old record, since it gets unloaded
// NOTE: This mixin is only needed for models that have both of the following features;
//    a) are pushed down via websockets
//    b) are able to be created by the user with POST

export default Mixin.create({
  save(options) {
    if (this.get('isNew')) {
      return this.saveManual(options).then(savedRecord => {
        // Since the saved record is not actually the same record as the one that was passed,
        // we need to unload the old record
        this.unloadRecord();
        return savedRecord;
      });
    }
    // If the record is not brand new, just use the standard save method
    return this._super(...arguments);
  },

  saveManual(options) {
    let store = this.get('store');
    let modelClass = store.modelFor(this.constructor.modelName);
    let internalModel = this._internalModel; // I know, I know, it's private.....

    let adapter = store.adapterFor(modelClass.modelName);
    return adapter.createRecordManual(store, modelClass, internalModel.createSnapshot(options));
  },
});
