const { expect, sinon } = require('../../../test-helper');
const getCampaignParticipation = require('../../../../lib/domain/usecases/get-campaign-participation');

describe('Unit | UseCase | get-campaign-participation', () => {

  let campaignParticipationRepository;

  beforeEach(() => {
    campaignParticipationRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the campaignParticipation', async () => {
    // given
    const campaignParticipationId = 1;
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves('ok');

    // when
    const result = await getCampaignParticipation({ campaignParticipationId, campaignParticipationRepository });

    // then
    expect(result).to.equal('ok');
  });
});
