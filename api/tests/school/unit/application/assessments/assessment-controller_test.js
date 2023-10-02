import { expect, hFake, sinon } from '../../../../test-helper.js';
import { assessmentController } from '../../../../../lib/application/assessments/assessment-controller.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
import * as events from '../../../../../lib/domain/events/index.js';

describe('Unit | Controller | assessment-controller', function () {
  describe('#getNextChallengeForPix1d', function () {
    it('should call the expected usecase', async function () {
      const assessmentId = 104974;
      const challenge = { id: 'rec1', instruction: '1st challenge for Pix1d' };
      const challengeSerializerStub = { serialize: sinon.stub() };
      challengeSerializerStub.serialize.resolves(challenge);

      // given
      const request = {
        params: {
          id: assessmentId,
        },
      };

      sinon.stub(usecases, 'getNextChallengeForPix1d').withArgs({ assessmentId }).resolves(challenge);

      // when
      const result = await assessmentController.getNextChallengeForPix1d(request, hFake, {
        challengeSerializer: challengeSerializerStub,
      });

      // then
      expect(result).to.be.equal(challenge);
    });
  });
});
