/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */

import { describe, it, assert } from 'vitest';
import { remoteData } from '../prelude';

describe('RemoteData', () => {
  describe('filterOrElse', () => {
    const keep = remoteData.filterOrElse(
      () => true,
      () => 'alt',
    );
    const reject = remoteData.filterOrElse(
      () => false,
      () => 'alt',
    );

    it('should be stable for remoteData.initial', () => {
      const rd: remoteData.RemoteData<string, number> = remoteData.initial;
      assert.strictEqual(keep(rd), rd);
      assert.strictEqual(reject(rd), rd);
    });

    it('should be stable for remoteData.pending', () => {
      const rd: remoteData.RemoteData<string, number> = remoteData.pending;
      assert.strictEqual(keep(rd), rd);
      assert.strictEqual(reject(rd), rd);
    });

    it('should be stable for remoteData.failure', () => {
      const rd: remoteData.RemoteData<string, number> = remoteData.failure('initial');
      assert.strictEqual(keep(rd), rd);
      assert.strictEqual(reject(rd), rd);
    });

    it('should be stable for remoteData.success when the predicate succeeds', () => {
      const rd: remoteData.RemoteData<string, number> = remoteData.success(1);
      assert.strictEqual(keep(rd), rd);
    });

    it('should transform success to failure when the predicate fails', () => {
      const rd: remoteData.RemoteData<string, number> = remoteData.success(1);
      assert.deepEqual(reject(rd), remoteData.failure('alt'));
    });
  });
});
