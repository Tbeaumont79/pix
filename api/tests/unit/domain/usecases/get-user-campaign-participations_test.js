const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserCampaignParticipations = require('../../../../lib/domain/usecases/get-user-campaign-participations');

describe('Unit | UseCase | get-user-campaign-participations', () => {

  let authenticatedUserId;
  let requestedUserId;
  const campaignParticipationRepository = { findByUserId: () => undefined };

  it('should reject a NotAuthorized error if authenticated user ask for another user campaign participation', () => {
    // given
    authenticatedUserId = 1;
    requestedUserId = 2;

    // when
    const promise = getUserCampaignParticipations({ authenticatedUserId, requestedUserId, campaignParticipationRepository });

    // then
    return promise.catch((err) => {
      expect(err).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When authenticated User is authorized to retrieve his campaign participations', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(campaignParticipationRepository, 'findByUserId');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call findByUserId to find all campaign-participations', () => {
      // given
      authenticatedUserId = 1;
      requestedUserId = 1;
      campaignParticipationRepository.findByUserId.resolves();

      // when
      const promise = getUserCampaignParticipations({
        authenticatedUserId,
        requestedUserId,
        campaignParticipationRepository,
      });

      // then
      return promise.then(() => {
        expect(campaignParticipationRepository.findByUserId).to.have.been.calledWith(requestedUserId);
      });
    });

    it('should return user with his campaign participations', () => {
      // given
      const campaignParticipation1 = campaignParticipationRepository.findByUserId.resolves(domainBuilder.buildCampaignParticipation({ userId: requestedUserId }));
      const campaignParticipation2 = campaignParticipationRepository.findByUserId.resolves(domainBuilder.buildCampaignParticipation({ userId: requestedUserId }));
      campaignParticipationRepository.findByUserId.resolves([campaignParticipation1, campaignParticipation2]);

      // when
      const promise = getUserCampaignParticipations({
        authenticatedUserId,
        requestedUserId,
        campaignParticipationRepository,
      });

      // then
      return promise.then((foundCampaignParticipations) => {
        expect(foundCampaignParticipations).to.be.an.instanceOf(Array);
        expect(foundCampaignParticipations).to.have.length(2);
        expect(foundCampaignParticipations[0]).to.equal(campaignParticipation1);
        expect(foundCampaignParticipations[1]).to.equal(campaignParticipation2);
      });
    });
  });
});
