import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import InformationSection from 'pix-admin/components/organizations/information-section';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/information-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when editing organization', function (hooks) {
    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
    });

    const organization = EmberObject.create({
      id: 1,
      name: 'Organization SCO',
      externalId: 'VELIT',
      provinceCode: 'h50',
      email: 'sco.generic.account@example.net',
      isOrganizationSCO: true,
      isManagingStudents: false,
      credit: 0,
      documentationUrl: 'https://pix.fr/',
      showSkills: false,
    });

    test('it should toggle edition mode on click to edit button', async function (assert) {
      // given
      const screen = await render(<template><InformationSection @organization={{organization}} /></template>);

      // when
      await clickByName('Modifier');

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Nom *' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Identifiant externe' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
    });

    test('it should toggle display mode on click to cancel button', async function (assert) {
      // given
      const screen = await render(<template><InformationSection @organization={{organization}} /></template>);
      await clickByName('Modifier');

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Organization SCO' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
      assert.dom(screen.getByRole('button', { name: "Archiver l'organisation" })).exists();
    });

    test('it should revert changes on click to cancel button', async function (assert) {
      // given
      const screen = await render(<template><InformationSection @organization={{organization}} /></template>);

      await clickByName('Modifier');

      await fillIn(screen.getByLabelText('Nom *', { exact: false }), 'new name');
      await fillByLabel('Identifiant externe', 'new externalId');
      await fillByLabel('Département (en 3 chiffres)', 'new provinceCode');
      await clickByName('Gestion d’élèves/étudiants');
      await fillByLabel('Lien vers la documentation', 'new documentationUrl');
      await clickByName("Affichage des acquis dans l'export de résultats");
      await clickByName("Activer l'envoi multiple pour les campagnes de type évaluation");

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.getByRole('heading', { name: organization.name })).exists();
      assert.dom(screen.getByText(`Identifiant externe : ${organization.externalId}`)).exists();
      assert.dom(screen.getByText(`Département : ${organization.provinceCode}`)).exists();
      assert.dom(screen.getByRole('link', { name: organization.documentationUrl })).exists();
      assert.dom(screen.getByText(`Gestion d’élèves/étudiants : Non`)).exists();
      assert.dom(screen.getByText("Affichage des acquis dans l'export de résultats : Non")).exists();
      assert.dom(screen.getByText("Activer l'envoi multiple sur les campagnes d'évaluation : Non")).exists();
    });

    test('it should submit the form if there is no error', async function (assert) {
      // given
      const onSubmit = () => {};
      const store = this.owner.lookup('service:store');
      const oidcIdentityProvider1 = store.createRecord('oidc-identity-provider', {
        code: 'OIDC-1',
        organizationName: 'organization 1',
        shouldCloseSession: false,
        source: 'source1',
      });
      const oidcIdentityProvider2 = store.createRecord('oidc-identity-provider', {
        code: 'OIDC-2',
        organizationName: 'organization 2',
        shouldCloseSession: false,
        source: 'source2',
      });
      class OidcIdentittyProvidersStub extends Service {
        list = [oidcIdentityProvider1, oidcIdentityProvider2];
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentittyProvidersStub);

      const screen = await render(
        <template><InformationSection @organization={{organization}} @onSubmit={{onSubmit}} /></template>,
      );
      await clickByName('Modifier');

      await fillIn(screen.getByLabelText('Nom *', { exact: false }), 'new name');
      await fillByLabel('Identifiant externe', 'new externalId');
      await fillByLabel('Département (en 3 chiffres)', '   ');
      await fillByLabel('Crédits', 50);
      await clickByName('Gestion d’élèves/étudiants');
      await fillByLabel('Lien vers la documentation', 'https://pix.fr/');
      await clickByName('SSO');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'organization 2' }));
      await clickByName("Affichage des acquis dans l'export de résultats");
      await clickByName("Activer l'envoi multiple pour les campagnes de type évaluation");
      await clickByName('Activer la page Places sur PixOrga');

      // when
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByRole('heading', { name: 'new name' })).exists();
      assert.dom(screen.getByText('Identifiant externe : new externalId')).exists();
      assert.dom(screen.queryByText('Département : ')).doesNotExist();
      assert.dom(screen.getByText('Crédits : 50')).exists();
      assert.dom(screen.getByText('Gestion d’élèves/étudiants : Oui')).exists();
      assert.dom(screen.getByRole('link', { name: 'https://pix.fr/' })).exists();
      assert.dom(screen.getByText('SSO : organization 2')).exists();
      assert.dom(screen.getByText("Activer l'envoi multiple sur les campagnes d'évaluation : Oui")).exists();
      assert.dom(screen.getByText('Activer la page Places sur PixOrga : Oui')).exists();
    });
  });
});
