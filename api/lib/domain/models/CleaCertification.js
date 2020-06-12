const _ = require('lodash');
const Badge = require('../models/Badge');
const PartnerCertification = require('./PartnerCertification');
const { NotEligibleCandidateError } = require('../errors');
const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));
const { validateEntity } = require('../validators/entity-validator');

const MIN_PERCENTAGE = 75;

const { MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED, MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED } = require('../constants');

function _isOverPercentage(value = 0, total, percentage = MIN_PERCENTAGE) {
  return value >= (total * percentage / 100);
}

function _hasRequiredPixValue({ maxReachablePixByCompetenceForClea, competenceMarks }) {
  const certifiableCompetenceIds = _.map(competenceMarks, 'competenceId');
  return !_.isEmpty(certifiableCompetenceIds)
    && _.every(certifiableCompetenceIds, (competenceId) => _isOverPercentage(
      _.find(competenceMarks, { competenceId }).score,
      maxReachablePixByCompetenceForClea[competenceId]
    ));
}

function _hasSufficientReproducibilityRateToBeTrusted(reproducibilityRate) {
  return reproducibilityRate >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED;
}

function _hasNotMinimumReproducibilityRateToBeCertified(reproducibilityRate) {
  return reproducibilityRate <= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED;
}

class CleaCertification extends PartnerCertification {

  constructor({
    certificationCourseId,
    hasAcquiredBadge,
    reproducibilityRate,
    competenceMarks,
    maxReachablePixByCompetenceForClea,
  } = {}) {
    super({
      certificationCourseId,
      partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
    });

    this.hasAcquiredBadge = hasAcquiredBadge;
    this.reproducibilityRate = reproducibilityRate;
    this.competenceMarks = competenceMarks;
    this.maxReachablePixByCompetenceForClea = maxReachablePixByCompetenceForClea;

    const schema = Joi.object({
      hasAcquiredBadge: Joi.boolean().required(),
      reproducibilityRate: Joi.number().required(),
      competenceMarks: Joi.array().min(1).required(),
      maxReachablePixByCompetenceForClea: Joi.object().min(1).required(),
    }).unknown();

    validateEntity(schema, this);
  }

  isEligible() {
    return this.hasAcquiredBadge;
  }

  isAcquired() {
    if (!this.hasAcquiredBadge) throw new NotEligibleCandidateError();

    if (_hasNotMinimumReproducibilityRateToBeCertified(this.reproducibilityRate)) return false;

    if (_hasSufficientReproducibilityRateToBeTrusted(this.reproducibilityRate)) return true;

    return _hasRequiredPixValue({
      competenceMarks: this.competenceMarks,
      maxReachablePixByCompetenceForClea: this.maxReachablePixByCompetenceForClea
    });
  }
}

module.exports = CleaCertification;
