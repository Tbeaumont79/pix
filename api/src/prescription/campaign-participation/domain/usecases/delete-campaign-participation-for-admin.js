import bluebird from 'bluebird';

const deleteCampaignParticipationForAdmin = async function ({
  userId,
  campaignParticipationId,
  campaignRepository,
  campaignParticipationRepository,
}) {
  const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

  const campaignParticipations =
    await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
      campaignId,
      campaignParticipationId,
    });

  await bluebird.mapSeries(campaignParticipations, async (campaignParticipation) => {
    campaignParticipation.delete(userId);
    const { id, deletedAt, deletedBy } = campaignParticipation;
    await campaignParticipationRepository.remove({ id, deletedAt, deletedBy });
  });
};

export { deleteCampaignParticipationForAdmin };
