import EmberObject from '@ember/object';
import {expect} from 'chai';
import {describe, it} from 'mocha';
import {simpleImageHelper} from 'percy-web/helpers/simple-image';

describe('simple-image helper', function () {
  it('renders image tag', function () {
    let image = EmberObject.create({
      url: '/foo',
      width: 100,
      height: 200,
    });
    let html = simpleImageHelper(undefined, {image: image, altText: 'alt-text'});
    expect(html.string).to.equal(
      '<img class="" src="/foo" width="100" height="200" alt="alt-text">',
    );

    html = simpleImageHelper(undefined, {image: image, classes: 'bar', altText: 'alt-text'});
    expect(html.string).to.equal(
      '<img class="bar" src="/foo" width="100" height="200" alt="alt-text">',
    );
  });
});
