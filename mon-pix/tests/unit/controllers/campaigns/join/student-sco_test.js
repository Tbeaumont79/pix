import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | campaigns | join | student-sco', () => {
  setupTest();

  let controller;
  let sessionStub;
  let currentUserStub;
  const campaignCode = 'AZERTY999';
  const expectedUserId = 1;

  beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.join.student-sco');

    sessionStub = {
      set: sinon.stub(),
      authenticate: sinon.stub(),
    };
    currentUserStub = {
      load: sinon.stub().resolves(),
      user: {
        save: sinon.stub().resolves(),
        id: expectedUserId,
      },
    };

    controller.set('model', { code: campaignCode });
    controller.set('session', sessionStub);
    controller.set('currentUser', currentUserStub);
  });

  describe('#addGarAuthenticationMethodToUser', () => {
    it('should add GAR authentication method and clear IdToken', async () => {
      // given
      const externalUserToken = 'ABCD';

      const expectedExternalUserAuthenticationRequest = {
        externalUserToken,
        expectedUserId,
        username: 'saml',
        password: 'jackson',
        save: sinon.stub(),
      };

      const saveStub = sinon.stub();
      const storeStub = { createRecord: sinon.stub().returns({ save: saveStub }) };
      controller.set('store', storeStub);

      // when
      await controller.actions.addGarAuthenticationMethodToUser.call(
        controller,
        expectedExternalUserAuthenticationRequest
      );

      // then
      sinon.assert.calledOnce(expectedExternalUserAuthenticationRequest.save);
      sinon.assert.calledWith(sessionStub.set, 'data.externalUser', null);
      sinon.assert.calledWith(sessionStub.set, 'data.expectedUserId', null);
    });

    it('should reconcile user', async () => {
      // given
      const expectedExternalUserAuthenticationRequest = {
        save: sinon.stub(),
      };

      const expectedCampaignCode = campaignCode;

      const expectedStoreOptions = {
        arg1: 'sco-organization-learner',
        arg2: { userId: expectedUserId, campaignCode: expectedCampaignCode },
      };
      const expectedSaveOptions = { adapterOptions: { tryReconciliation: true } };

      const saveStub = sinon.stub();
      const storeStub = { createRecord: sinon.stub().returns({ save: saveStub }) };
      controller.set('store', storeStub);

      // when
      await controller.actions.addGarAuthenticationMethodToUser.call(
        controller,
        expectedExternalUserAuthenticationRequest
      );

      // then
      sinon.assert.calledWith(storeStub.createRecord, expectedStoreOptions.arg1, expectedStoreOptions.arg2);
      sinon.assert.calledWith(saveStub, expectedSaveOptions);
    });
  });
});
