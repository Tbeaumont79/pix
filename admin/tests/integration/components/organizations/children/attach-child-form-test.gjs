import { clickByName, fillByLabel, render as renderScreen } from '@1024pix/ember-testing-library';
import AttachChildForm from 'pix-admin/components/organizations/children/attach-child-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component |  organizations/children/attach-child-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('display attach child form', async function (assert) {
    //  when
    const screen = await renderScreen(<template><AttachChildForm /></template>);

    // then
    assert.dom(screen.getByRole('form', { name: `Formulaire d'ajout d'une organisation fille` })).exists();
    assert
      .dom(screen.getByRole('textbox', { name: `Ajouter une organisation fille ID de l'organisation à ajouter` }))
      .exists();
    assert.dom(screen.getByRole('button', { name: 'Ajouter' })).exists();
  });

  module('when submitting the form', function () {
    test('emits an event with "childOrganization" component attribute value and clears the input', async function (assert) {
      // given
      const onFormSubmitted = sinon.stub();
      const screen = await renderScreen(<template><AttachChildForm @onFormSubmitted={{onFormSubmitted}} /></template>);
      await fillByLabel(`Ajouter une organisation fille ID de l'organisation à ajouter`, '12345');

      // when
      await clickByName('Ajouter');

      // then
      assert.true(onFormSubmitted.calledOnceWithExactly('12345'));
      assert
        .dom(screen.getByRole('textbox', { name: `Ajouter une organisation fille ID de l'organisation à ajouter` }))
        .hasValue('');
    });
  });
});
