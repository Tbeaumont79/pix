import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { databaseBuilder, expect, mockLearningContent } from '../../../../../test-helper.js';

describe('Integration | UseCase | find-campaign-profiles-collection-participation-summaries', function () {
  let organizationId;
  let campaignId;
  let userId;

  beforeEach(async function () {
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId }).id;

    databaseBuilder.factory.buildMembership({ organizationId, userId });

    await mockLearningContent({ skills: [], tubes: [], competences: [], areas: [] });

    await databaseBuilder.commit();
  });

  context('when there are filters', function () {
    beforeEach(async function () {
      const participation1 = { participantExternalId: 'Yubaba', campaignId, status: 'SHARED' };
      const participant1 = { firstName: 'Chihiro', lastName: 'Ogino' };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant1, participation1);

      const participation2 = { participantExternalId: 'Meï', campaignId, status: 'SHARED' };
      const participant2 = { firstName: 'Tonari', lastName: 'No Totoro' };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant2, participation2);

      await databaseBuilder.commit();
    });
    it('returns the list filtered by the search', async function () {
      const { data } = await usecases.findCampaignProfilesCollectionParticipationSummaries({
        userId,
        campaignId,
        filters: { search: 'Tonari N' },
      });
      expect(data).to.have.lengthOf(1);
    });
  });
});
