import { action } from '@ember/object';
import Component from '@glimmer/component';

import { SMART_RANDOM_STEPS } from './SMART_RANDOM_STEPS';

const SKILLS_STATUSES = {
  MISSING: 'missing',
  CURRENT: 'current',
  PRESENT: 'present',
  ELIMINATED: 'eliminated',
};

const PRIMARY_COLOR = 'primary';
const NEUTRAL_COLOR = 'neutral';

export default class TubesViewer extends Component {
  levels = [1, 2, 3, 4, 5, 6, 7, 8];

  get steps() {
    return this.args.smartRandomDetails.steps;
  }

  get predictedLevel() {
    return this.args.smartRandomDetails.predictedLevel;
  }

  @action
  getStepTagColor(stepIndex) {
    return stepIndex <= this.args.displayedStepIndex ? PRIMARY_COLOR : NEUTRAL_COLOR;
  }

  @action
  getEliminatedSkillsByStepCount(stepIndex) {
    const currentStep = this.steps[stepIndex];
    const currentStepSkillsCount = currentStep.outputSkills.length;

    if (stepIndex === 0) return this.args.totalNumberOfSkills - currentStepSkillsCount;

    const previousStep = this.steps[stepIndex - 1];
    const previousStepSkillsCount = previousStep.outputSkills.length;

    return previousStepSkillsCount - currentStepSkillsCount;
  }

  @action
  getRemainingSkillsCountAfterStep(stepIndex) {
    return this.steps[stepIndex].outputSkills.length;
  }

  @action
  getSkillStatus(tube, level) {
    const skillInTube = tube.skills.find((skill) => skill.difficulty === level);

    if (!skillInTube) return SKILLS_STATUSES.MISSING;

    const isCurrentSkill = this.isSkillTheCurrentSkill(skillInTube);
    if (isCurrentSkill) return SKILLS_STATUSES.CURRENT;

    const knowledgeElementForSkill = this.knowledgeElementForSkill(skillInTube);
    if (knowledgeElementForSkill) return knowledgeElementForSkill.status;

    const skillInSelectedStep = this.isSkillInSelectedStep(skillInTube);
    if (!skillInSelectedStep) return SKILLS_STATUSES.ELIMINATED;

    return SKILLS_STATUSES.PRESENT;
  }

  isSkillTheCurrentSkill(skill) {
    return skill.id === this.args.currentSkillId;
  }

  isSkillInSelectedStep(skill) {
    return this.steps[this.args.displayedStepIndex].outputSkills.some((outputSkill) => outputSkill.id === skill.id);
  }

  knowledgeElementForSkill(skill) {
    return this.args.knowledgeElements.find((knowledgeElement) => knowledgeElement.skillId === skill.id);
  }

  getStepName(stepName) {
    return SMART_RANDOM_STEPS[stepName].translatedName;
  }

  getStepDescription(stepName) {
    return SMART_RANDOM_STEPS[stepName].description;
  }
}