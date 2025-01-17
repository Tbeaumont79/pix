import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { constants } from '../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect, sinon } from '../../../test-helper.js';

const { STARTED, SHARED, TO_SHARE } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Participation', function () {
  describe('#hasAssessmentParticipations', function () {
    let userId;

    beforeEach(async function () {
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should return true if the user has participations to campaigns of type assement', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(true);
    });

    it('should return false if the user does not have participations', async function () {
      // given
      const otherUser = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: otherUser.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(false);
    });

    it('should return false if the user does not have participations to campaigns of type assement', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(false);
    });

    it('should return false if the user only have autonomouse-course participations', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({
        id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
      });
      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        type: CampaignTypes.ASSESSMENT,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#getCodeOfLastParticipationToProfilesCollectionCampaignForUser', function () {
    let userId;
    const expectedCode = 'GOOD';

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should return null if there is no participations', async function () {
      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if there is no participations to share', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: SHARED,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if participations are deleted', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        deletedAt: new Date(),
        userId,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if there is no campaigns of type profiles collection', async function () {
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if there is no participations for the user', async function () {
      const otherUser = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId: otherUser.id,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if campaign is archived', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', archivedAt: new Date() });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId,
        createdAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return code of the last participation to a campaign of type PROFILES_COLLECTION for the user', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: expectedCode });
      const otherCampaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: 'BAD' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaign.id,
        status: TO_SHARE,
        createdAt: new Date(Date.parse('11/11/2011')),
        userId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId,
        createdAt: new Date(Date.parse('12/11/2011')),
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(expectedCode);
    });
  });

  describe('#get', function () {
    let campaignId;
    let campaignParticipationId, campaignParticipationNotSharedId;
    let campaignParticipationAssessments;

    beforeEach(async function () {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        validatedSkillsCount: 12,
      }).id;
      campaignParticipationNotSharedId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        status: STARTED,
        sharedAt: null,
      }).id;

      const assessment1 = databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId,
        createdAt: new Date('2000-01-01T10:00:00Z'),
      });

      const assessment2 = databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId,
        createdAt: new Date('2000-03-01T10:00:00Z'),
      });

      databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId: campaignParticipationNotSharedId,
        createdAt: new Date('2000-02-01T10:00:00Z'),
      });

      campaignParticipationAssessments = [assessment1, assessment2];

      await databaseBuilder.commit();
    });

    it('should return a campaign participation object', async function () {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // then
      expect(foundCampaignParticipation.id).to.equal(campaignParticipationId);
      expect(foundCampaignParticipation.validatedSkillsCount).to.equal(12);
    });

    it('should return a null object for sharedAt when the campaign-participation is not shared', async function () {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationNotSharedId);

      // then
      expect(foundCampaignParticipation.sharedAt).to.be.null;
    });

    it('returns the assessments of campaignParticipation', async function () {
      //given
      const expectedAssessmentIds = campaignParticipationAssessments.map(({ id }) => id);

      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain(expectedAssessmentIds);
    });

    it('returns the campaign of campaignParticipation', async function () {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // then
      expect(foundCampaignParticipation.campaign.id).to.equal(campaignId);
    });

    it('returns the assessments of campaignParticipation using the transaction', async function () {
      //given
      const expectedAssessmentIds = campaignParticipationAssessments.map(({ id }) => id);

      // when
      const foundCampaignParticipation = await DomainTransaction.execute(() => {
        return campaignParticipationRepository.get(campaignParticipationId);
      });
      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain(expectedAssessmentIds);
    });
  });

  describe('#isRetrying', function () {
    let campaignId;
    let campaignParticipationId;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    context('When the user has just one participation shared', function () {
      beforeEach(async function () {
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: new Date('2002-10-10'),
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has just one participation not shared', function () {
      beforeEach(async function () {
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has several participations but all shared', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: new Date('2002-10-10'),
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has several participations but not in the same campaign', function () {
      beforeEach(async function () {
        const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          userId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When there is several participations but not for the same user', function () {
      beforeEach(async function () {
        const otherUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId: otherUserId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId: otherUserId,
          isImproved: false,
          sharedAt: null,
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user is retrying the campaign', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns true', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.true;
      });
    });
  });
});
