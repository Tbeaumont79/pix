import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | user-tutorials/saved', function () {
  setupTest();

  it('exists', function () {
    const route = this.owner.lookup('route:UserTutorialsSaved');
    expect(route).to.be.ok;
  });
});
