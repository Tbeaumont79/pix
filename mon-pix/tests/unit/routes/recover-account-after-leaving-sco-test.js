import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | recover-account-after-leaving-sco', function() {
  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:recover-account-after-leaving-sco');
    expect(route).to.be.ok;
  });
});
