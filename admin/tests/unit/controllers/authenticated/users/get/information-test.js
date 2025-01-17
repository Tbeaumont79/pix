import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/users/get/authentication-methods', function (hooks) {
  setupTest(hooks);
  module('#reassignAuthenticationMethodToAnotherUser', function () {
    module('With Pole Emploi identity provider', function () {
      test('should display error message when an 422 error occurred', async function (assert) {
        // given
        const identityProvider = 'POLE_EMPLOI';
        const controller = this.owner.lookup('controller:authenticated.users.get.authentication-methods');

        const originUserId = 1;
        const targetUserId = 2;

        const destroyRecordStub = sinon.stub();
        const rollbackAttributesStub = sinon.stub();
        destroyRecordStub
          .withArgs({
            adapterOptions: {
              reassignAuthenticationMethodToAnotherUser: true,
              targetUserId,
              originUserId,
              identityProvider,
            },
          })
          .rejects({ errors: [{ status: '422' }] });
        const authenticationMethods = [
          EmberObject.create({
            identityProvider,
            destroyRecord: destroyRecordStub,
            rollbackAttributes: rollbackAttributesStub,
          }),
        ];
        const userProfile = EmberObject.create({ id: originUserId, authenticationMethods });

        controller.model = { userProfile, authenticationMethods };
        controller.pixToast = {
          sendSuccessNotification: sinon.stub(),
          sendErrorNotification: sinon.stub(),
        };
        controller.pixToast.sendErrorNotification.resolves();

        // when
        await controller.reassignAuthenticationMethod({ targetUserId, identityProvider });

        // then
        sinon.assert.calledWith(controller.pixToast.sendErrorNotification, {
          message: controller.ERROR_MESSAGES.STATUS_422.POLE_EMPLOI,
        });
        assert.ok(true);
      });
    });
  });
});
