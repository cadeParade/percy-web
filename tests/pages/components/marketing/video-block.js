import {create, clickable} from 'ember-cli-page-object';

const SELECTORS = {
  IMAGE: '[data-test-video-block-image]',
  VIDEO_MODAL: '.ember-modal-dialog',
};

const VideoBlock = {
  modalScope: SELECTORS.VIDEO_MODAL,
  clickImage: clickable(SELECTORS.IMAGE),
};

export default create(VideoBlock);
