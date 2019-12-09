import {expect} from 'chai';
import {describe, it} from 'mocha';
import groupSnapshots from 'percy-web/lib/group-snapshots';

describe('grouping snapshots', function() {
  const snapshotGroupA1 = {fingerprint: 'aaa'};
  const snapshotGroupA2 = {fingerprint: 'aaa'};
  const snapshotGroupB1 = {fingerprint: 'bbb'};
  const snapshotGroupB2 = {fingerprint: 'bbb'};
  const snapshotSingle1 = {fingerprint: 'ccc'};
  const snapshotSingle2 = {fingerprint: 'ddd'};
  const snapshotNullGroup1 = {fingerprint: null};
  const snapshotUndefinedGroup1 = {fingerprint: undefined};
  const snapshotUndefinedGroup2 = {fingerprint: undefined};

  describe('group snapshots', function() {
    it('separates single snapshots', async function() {
      const orderedSnapshots = [snapshotGroupA1, snapshotSingle1, snapshotGroupA2];
      const result = groupSnapshots(orderedSnapshots);
      expect(result).to.eql({
        singles: [snapshotSingle1],
        groups: [[snapshotGroupA1, snapshotGroupA2]],
      });
    });

    it('includes snapshots with null fingerprint in "singles" array', async function() {
      const orderedSnapshots = [snapshotGroupA1, snapshotNullGroup1, snapshotGroupA2];
      const result = groupSnapshots(orderedSnapshots);
      expect(result).to.eql({
        singles: [snapshotNullGroup1],
        groups: [[snapshotGroupA1, snapshotGroupA2]],
      });
    });

    it('includes snapshots with undefined fingerprint in "singles" array', async function() {
      const orderedSnapshots = [snapshotGroupA1, snapshotUndefinedGroup1, snapshotGroupA2];
      const result = groupSnapshots(orderedSnapshots);
      expect(result).to.eql({
        singles: [snapshotUndefinedGroup1],
        groups: [[snapshotGroupA1, snapshotGroupA2]],
      });
    });

    describe('_numericSort', function() {
      it('sorts singles array according to original index', async function() {
        const orderedSnapshots = [
          snapshotSingle2,
          snapshotNullGroup1,
          snapshotSingle1,
          snapshotGroupB1,
          snapshotGroupB2,
          snapshotUndefinedGroup2,
          snapshotUndefinedGroup1,
        ];
        const result = groupSnapshots(orderedSnapshots);
        expect(result.singles).to.eql([
          snapshotSingle2,
          snapshotNullGroup1,
          snapshotSingle1,
          snapshotUndefinedGroup2,
          snapshotUndefinedGroup1,
        ]);
      });
    });

    describe('groupSort', function() {
      it('sorts groups with more snapshots first', async function() {
        const snapshotGroupA3 = {fingerprint: 'aaa'};
        const orderedSnapshots = [
          snapshotGroupA3,
          snapshotGroupB2,
          snapshotGroupB1,
          snapshotGroupA1,
          snapshotGroupA2,
        ];
        const result = groupSnapshots(orderedSnapshots);
        expect(result).to.eql({
          singles: [],
          groups: [
            [snapshotGroupA3, snapshotGroupA1, snapshotGroupA2],
            [snapshotGroupB1, snapshotGroupB2],
          ],
        });
      });

      it('sorts groups by first snapshot index when length is equal', async function() {
        const orderedSnapshots = [
          snapshotGroupB2,
          snapshotGroupB1,
          snapshotGroupA1,
          snapshotGroupA2,
        ];
        const result = groupSnapshots(orderedSnapshots);
        expect(result).to.eql({
          singles: [],
          groups: [
            [snapshotGroupB2, snapshotGroupB1],
            [snapshotGroupA1, snapshotGroupA2],
          ],
        });
      });
    });
  });
});
