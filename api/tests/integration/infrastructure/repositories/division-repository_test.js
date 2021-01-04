const { expect, databaseBuilder } = require('../../../test-helper');
const divisionRepository = require('../../../../lib/infrastructure/repositories/division-repository');

describe('Integration | Repository | Division', () => {
  context('findByCampaignId', () => {
    it('returns the division from schooling registration associated to the given campaign', async () => {
      const division1 = '6emeB';
      const division2 = '3emeA';
      const campaign = databaseBuilder.factory.buildCampaign();

      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division1 }, { campaignId: campaign.id });
      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division2 }, { campaignId: campaign.id });
      await databaseBuilder.commit();

      const expectedDivision = [division1, division2];

      const divisions = await divisionRepository.findByCampaignId(campaign.id);

      expect(divisions).to.exactlyContain(expectedDivision);
    });

    context('when there are schooling registrations for another campaign of the same organization', () => {
      it('returns the division from schooling registration associated to the given campaign', async () => {
        const division1 = '6emeB';
        const division2 = '3emeA';
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division1 }, { campaignId: campaign.id });
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division2 });
        await databaseBuilder.commit();

        const expectedDivision = [division1];

        const divisions = await divisionRepository.findByCampaignId(campaign.id);

        expect(divisions).to.exactlyContain(expectedDivision);
      });
    });

    context('when a participant has schooling registrations for another organization', () => {
      it('returns the division from schooling registration associated to organization of the given campaign', async () => {
        const division1 = '4emeG';
        const division2 = '3emeC';
        const user = { id: 100001 };
        const campaign = databaseBuilder.factory.buildCampaign();
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division1, user }, { campaignId: campaign.id });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: otherCampaign.organizationId, division: division2, userId: user.id });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: otherCampaign.id, userId: user.id });
        await databaseBuilder.commit();

        const expectedDivision = [division1];

        const divisions = await divisionRepository.findByCampaignId(campaign.id);

        expect(divisions).to.exactlyContain(expectedDivision);
      });
    });

    context('when several participants have the same division', () => {
      it('returns each division one time', async () => {
        const division = '5eme1';
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division }, { campaignId: campaign.id });
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division }, { campaignId: campaign.id });
        await databaseBuilder.commit();

        const divisions = await divisionRepository.findByCampaignId(campaign.id);

        expect(divisions).to.exactlyContain([division]);
      });
    });
  });
});
