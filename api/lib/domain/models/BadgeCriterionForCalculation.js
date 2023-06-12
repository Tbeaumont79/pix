import _ from 'lodash';

export class BadgeCriterionForCalculation {
  constructor({ threshold, skillIds }) {
    this.threshold = threshold;
    this.skillIds = skillIds;
  }

  isFulfilled(knowledgeElements) {
    const knowledgeElementsInSkills = _removeKnowledgeElementsNotInSkills(knowledgeElements, this.skillIds);
    const validatedSkillsCount = knowledgeElementsInSkills.filter(
      (knowledgeElement) => knowledgeElement.isValidated
    ).length;
    const totalSkillsCount = this.skillIds.length;
    const masteryPercentage = _computeMasteryPercentage(validatedSkillsCount, totalSkillsCount);
    return masteryPercentage >= this.threshold;
  }
}

function _removeKnowledgeElementsNotInSkills(knowledgeElements, skillIds) {
  return _.filter(knowledgeElements, (knowledgeElement) => skillIds.some((id) => id === knowledgeElement.skillId));
}

function _computeMasteryPercentage(validatedSkillsCount, totalSkillsCount) {
  if (totalSkillsCount === 0) return 0;
  return Math.round((validatedSkillsCount * 100) / totalSkillsCount);
}
