import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | authenticated/users/index', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/users/index');
    assert.ok(route);
  });
});
