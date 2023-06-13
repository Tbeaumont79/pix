const levels = {
  TUTORIAL: 'TUTORIAL',
  TRAINING: 'TRAINING',
  VALIDATION: 'VALIDATION',
  CHALLENGE: 'CHALLENGE',
};
const status = {
  STARTED: 'STARTED',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
};

class Activity {
  constructor({ id, assessmentId, createdAt, level, status } = {}) {
    this.id = id;
    this.assessmentId = assessmentId;
    this.createdAt = createdAt;
    this.level = level;
    this.status = status;
  }
}

Activity.levels = levels;
Activity.status = status;

export { Activity };
