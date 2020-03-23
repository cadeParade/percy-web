import {expect} from 'chai';
import {it, describe} from 'mocha';
import {areInstallationIdsEqual} from 'percy-web/components/setup-github-app';

describe('areInstallationIdsEqual', function () {
  it('compares string installationIds', function () {
    expect(areInstallationIdsEqual('1', '2')).to.equal(false);
    expect(areInstallationIdsEqual('1', '1')).to.equal(true);
  });

  it('compares mixed type installationIds', function () {
    expect(areInstallationIdsEqual(1, '2')).to.equal(false);
    expect(areInstallationIdsEqual(1, '1')).to.equal(true);
  });

  it('compares integer installationIds', function () {
    expect(areInstallationIdsEqual(1, 2)).to.equal(false);
    expect(areInstallationIdsEqual(1, 1)).to.equal(true);
  });
});
