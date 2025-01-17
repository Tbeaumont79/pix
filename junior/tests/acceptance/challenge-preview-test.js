import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationTest, t } from '../helpers';

module('Acceptance | ChallengePreview', function (hooks) {
  setupApplicationTest(hooks);

  test('displays challenge preview', async function (assert) {
    // given
    const challenge = this.server.create('challenge', 'withInstructions');
    // when
    const screen = await visit(`/challenges/${challenge.id}/preview`);
    // then
    assert.dom(screen.getByText(`${challenge.instructions[0]}`)).exists();
  });

  test('displays ko message', async function (assert) {
    const challenge = this.server.create('challenge');

    const screen = await visit(`/challenges/${challenge.id}/preview`);
    await fillIn(screen.getByLabelText('Rue de :'), 'bad-answer');
    await click(screen.getByRole('button', { name: t('pages.challenge.actions.check') }));

    assert.dom(screen.getByText(t('pages.challenge.messages.wrong-answer'))).exists();
  });

  test('action button should redirect to home', async function (assert) {
    const challenge = this.server.create('challenge');

    const screen = await visit(`/challenges/${challenge.id}/preview`);
    await click(screen.getByRole('button', { name: t('pages.challenge.actions.skip') }));

    assert.strictEqual(currentURL(), '/organization-code');
  });
});
