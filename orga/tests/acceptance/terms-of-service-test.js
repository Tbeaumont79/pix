import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  authenticateSession,
  currentSession
} from 'ember-simple-auth/test-support';
import {
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | terms-of-service', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  test('it should redirect user to login page if not logged in', async function(assert) {
    // when
    await visit('/cgu');

    // then
    assert.equal(currentURL(), '/connexion');
    assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
  });

  module('When user has not accepted terms of service yet', function(hooks) {

    hooks.beforeEach(async () => {
      user = createUserWithMembership();

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should send request for saving Pix-orga terms of service acceptation when submitting', async function(assert) {
      // given
      const previousPixOrgaTermsOfServiceVal = user.pixOrgaTermsOfServiceAccepted;
      await visit('/cgu');

      // when
      await click('button[type=submit]');

      // then
      user.reload();
      const actualPixOrgaTermsOfServiceVal = user.pixOrgaTermsOfServiceAccepted;
      assert.equal(actualPixOrgaTermsOfServiceVal, true);
      assert.equal(previousPixOrgaTermsOfServiceVal, false);
    });

    test('it should redirect to campaign list after saving terms of service acceptation', async function(assert) {
      // given
      await visit('/cgu');

      // when
      await click('button[type=submit]');

      // then
      assert.equal(currentURL(), '/campagnes');
    });

    test('it should logout when user clicks on cancel button', async function(assert) {
      // given
      await visit('/cgu');

      // when
      await click('#terms-of-service-cancel-button');

      // then
      assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still authenticated');
    });

    test('it should not be possible to visit another page if cgu are not accepted', async function(assert) {
      // given
      await visit('/cgu');

      // when
      await visit('/campagnes');

      // then
      assert.equal(currentURL(), '/cgu');
    });

    module('When user has no user-orga-settings', () => {

      test('it should create the user-orga-settings', async function(assert) {
        // given
        await visit('/cgu');
        const previousSettingsCount = server.schema.userOrgaSettings.all().length;

        // when
        await click('button[type=submit]');

        // then
        const actualSettingsCount = server.schema.userOrgaSettings.all().length;
        assert.equal(actualSettingsCount, previousSettingsCount + 1);
      });

      test('it should reload the currentUser service', async function(assert) {
        const currentUser = this.owner.lookup('service:currentUser');

        // given
        await visit('/cgu');
        const previousOrganization = currentUser.organization;

        // when
        await click('button[type=submit]');

        // then
        const actualOrganization = currentUser.organization;
        assert.notOk(previousOrganization);
        const firstOrganization = currentUser.user.memberships.firstObject.organization;
        assert.equal(actualOrganization.id, firstOrganization.get('id'));
      });
    });
  });

  module('When user has already accepted terms of service', function(hooks) {

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should redirect to campaign list', async function(assert) {
      // when
      await visit('/cgu');

      // then
      assert.equal(currentURL(), '/campagnes');
    });
  });
});
