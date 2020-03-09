const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');

const faker = require('faker');

module.exports = function buildCampaignParticipationResult(
  {
    id = 1,
    areBadgeCriteriaFulfilled = false,
    isCompleted = faker.random.boolean(),
    masteryPercentage = 50,
    totalSkillsCount = 10,
    testedSkillsCount = 8,
    validatedSkillsCount = 5,
    competenceResults = [],
    badge,
  } = {}) {
  return new CampaignParticipationResult({
    id,
    areBadgeCriteriaFulfilled,
    isCompleted,
    masteryPercentage,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    competenceResults,
    badge,
  });
};
