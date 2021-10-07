import moment from 'moment';

import { module, test } from 'qunit';
import { click, currentURL, fillIn, findAll, triggerEvent, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import { visit as visitScreen } from '../../../helpers/testing-library';
import { createAuthenticateSession } from '../../../helpers/test-init';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';

module('Acceptance | authenticated/certification-centers/get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const certificationCenterData = {
    name: 'Center 1',
    externalId: 'ABCDEF',
    type: 'SCO',
  };

  let certificationCenter;
  let certificationCenterMembership1;
  let currentUser;

  hooks.beforeEach(async function () {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    certificationCenter = server.create('certification-center', certificationCenterData);

    certificationCenterMembership1 = server.create('certification-center-membership', {
      createdAt: new Date('2018-02-15T05:06:07Z'),
      certificationCenter,
      user: server.create('user'),
    });
    server.create('certification-center-membership', {
      createdAt: new Date('2019-02-15T05:06:07Z'),
      certificationCenter,
      user: server.create('user'),
    });
  });

  test('should access Certification center page by URL /certification-centers/:id', async function (assert) {
    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.equal(currentURL(), '/certification-centers/1');
  });

  test('should display Certification center detail', async function (assert) {
    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.contains(certificationCenter.name);
    assert.contains(certificationCenter.externalId);
    assert.contains(certificationCenter.type);
  });

  test('should display Certification center accreditations', async function (assert) {
    // given
    const accreditation1 = server.create('accreditation', { name: 'Pix+Edu' });
    const accreditation2 = server.create('accreditation', { name: 'Pix+Surf' });
    certificationCenter.update({ accreditations: [accreditation1, accreditation2] });

    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.contains('Pix+Edu');
    assert.contains('Pix+Surf');
  });

  test('should highlight the accreditations of the current certification center', async function (assert) {
    // given
    const accreditation1 = server.create('accreditation', { name: 'Pix+Edu' });
    const accreditation2 = server.create('accreditation', { name: 'Pix+Surf' });
    certificationCenter.update({ accreditations: [accreditation1, accreditation2] });

    server.create('accreditation', { name: 'Pix+Autre' });

    // when
    const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom(screen.getByLabelText('Accrédité pour Pix+Edu')).exists();
    assert.dom(screen.getByLabelText('Accrédité pour Pix+Surf')).exists();
    assert.dom(screen.getByLabelText('Non-accrédité pour Pix+Autre')).exists();
  });

  test('should display Certification center memberships', async function (assert) {
    // given
    const expectedDate1 = moment(certificationCenterMembership1.createdAt).format('DD-MM-YYYY - HH:mm:ss');

    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom('[aria-label="Membre"]').exists({ count: 2 });

    assert.dom('[aria-label="Membre"]:first-child td:nth-child(2)').hasText(certificationCenterMembership1.user.id);

    assert.contains(certificationCenterMembership1.user.firstName);
    assert.contains(certificationCenterMembership1.user.lastName);
    assert.contains(certificationCenterMembership1.user.email);
    assert.contains(expectedDate1);
  });

  module('To add certification center membership', function () {
    test('should display elements to add certification center membership', async function (assert) {
      // when
      await visit(`/certification-centers/${certificationCenter.id}`);

      // then
      assert.contains('Ajouter un membre');
      assert.dom('[aria-label="Adresse e-mail du nouveau membre"]').exists();
      assert.contains('Valider');
      assert.dom('.error').notExists;
    });

    test('should disable button if email is empty or contains only spaces', async function (assert) {
      // given
      const spacesEmail = ' ';
      await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillIn('#userEmailToAdd', spacesEmail);
      await triggerEvent('#userEmailToAdd', 'focusout');

      // then
      assert.dom('button[data-test-add-membership]').hasAttribute('disabled');
    });

    test('should display error message and disable button if email is invalid', async function (assert) {
      // given
      await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillIn('#userEmailToAdd', 'an invalid email');
      await triggerEvent('#userEmailToAdd', 'focusout');

      // then
      assert.contains("L'adresse e-mail saisie n'est pas valide.");
      assert.dom('button[data-test-add-membership]').hasAttribute('disabled');
    });

    test('should enable button and not display error message if email is valid', async function (assert) {
      // given
      await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillIn('#userEmailToAdd', 'test@example.net');
      await triggerEvent('#userEmailToAdd', 'focusout');

      // then
      assert.dom('button[data-test-add-membership]').hasNoAttribute('disabled');
      assert.dom('.error').notExists;
    });

    test('should display new certification-center-membership', async function (assert) {
      // given
      const email = 'test@example.net';
      await visit(`/certification-centers/${certificationCenter.id}`);
      await fillIn('#userEmailToAdd', email);
      await triggerEvent('#userEmailToAdd', 'focusout');

      // when
      await click('button[data-test-add-membership]');

      // then
      const foundElement = findAll('td[data-test-user-email]').find((element) => element.innerText.includes(email));
      assert.ok(foundElement);
    });
  });

  module('Update certification center', function () {
    test('should display a form after clicking on "Editer"', async function (assert) {
      // given
      await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await clickByLabel('Editer');

      // then
      assert.contains('Annuler');
      assert.contains('Enregistrer');
    });

    test('should send edited certification center to the API', async function (assert) {
      // given
      await visit(`/certification-centers/${certificationCenter.id}`);
      await clickByLabel('Editer');
      this.server.patch(`/certification-centers/${certificationCenter.id}`, () => new Response({}), 204);

      // when
      await fillInByLabel('Nom du centre', 'nouveau nom');
      await fillInByLabel('Type', 'SUP');
      await fillInByLabel('Identifiant externe', 'nouvel identifiant externe');
      await clickByLabel('Enregistrer');

      // then
      assert.contains('Habilitations aux certifications complémentaires');
      assert.contains('nouveau nom');
      assert.contains('SUP');
      assert.contains('nouvel identifiant externe');
    });

    test('should display a success notification when the certification has been successfully updated', async function (assert) {
      // given
      server.create('accreditation', { name: 'Pix+Surf' });
      server.create('accreditation', { name: 'Pix+Autre' });

      const screen = await visitScreen(`/certification-centers/${certificationCenter.id}`);
      await clickByLabel('Editer');
      this.server.patch(`/certification-centers/${certificationCenter.id}`, () => new Response({}), 204);

      // when
      await fillInByLabel('Nom du centre', 'Centre des réussites');
      await clickByLabel('Pix+Surf');
      await clickByLabel('Enregistrer');

      // then
      assert.dom(screen.getByLabelText('Accrédité pour Pix+Surf')).exists();
      assert.dom(screen.getByLabelText('Non-accrédité pour Pix+Autre')).exists();
      assert.contains('Habilitations aux certifications complémentaires');
      assert.contains('Centre des réussites');
      assert.contains('Centre de certification mis à jour avec succès.');
    });

    test('should display an error notification when the certification has not been updated in API', async function (assert) {
      // given
      this.server.patch(`/certification-centers/${certificationCenter.id}`, () => new Response({}), 422);
      await visit(`/certification-centers/${certificationCenter.id}`);
      await clickByLabel('Editer');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.contains('Habilitations aux certifications complémentaires');
      assert.contains("Une erreur est survenue, le centre de certification n'a pas été mis à jour.");
    });
  });
});
