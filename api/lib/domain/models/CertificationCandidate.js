const _ = require('lodash');
const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));
const { InvalidCertificationCandidate } = require('../errors');

const certificationCandidateValidationJoiSchema_v1_1 = Joi.object({
  id: Joi.number().optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthCity: Joi.string().required(),
  birthProvinceCode: Joi.string().required(),
  birthCountry: Joi.string().required(),
  externalId: Joi.string().allow(null).optional(),
  birthdate: Joi.string().length(10).required(),
  createdAt: Joi.any().allow(null).optional(),
  extraTimePercentage: Joi.number().allow(null).optional(),
  sessionId: Joi.number().required(),
  userId: Joi.number().allow(null).optional(),
});

const certificationCandidateValidationJoiSchema_v1_2 = Joi.object({
  id: Joi.number().optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthCity: Joi.string().required(),
  birthProvinceCode: Joi.string().required(),
  birthCountry: Joi.string().required(),
  externalId: Joi.string().allow(null).optional(),
  birthdate: Joi.string().length(10).required(),
  createdAt: Joi.any().allow(null).optional(),
  extraTimePercentage: Joi.number().allow(null).optional(),
  sessionId: Joi.number().required(),
  userId: Joi.number().allow(null).optional(),
});

const certificationCandidateParticipationJoiSchema = Joi.object({
  id: Joi.any().allow(null).optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthCity: Joi.any().allow(null).optional(),
  birthProvinceCode: Joi.any().allow(null).optional(),
  birthCountry: Joi.any().allow(null).optional(),
  externalId: Joi.any().allow(null).optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required(),
  createdAt: Joi.any().allow(null).optional(),
  extraTimePercentage: Joi.any().allow(null).optional(),
  sessionId: Joi.number().required(),
  userId: Joi.any().allow(null).optional(),
});

class CertificationCandidate {
  constructor(
    {
      id,
      // attributes
      firstName,
      lastName,
      birthCity,
      birthProvinceCode,
      birthCountry,
      externalId,
      birthdate,
      createdAt,
      extraTimePercentage,
      // includes
      // references
      sessionId,
      userId,
    } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthCity = birthCity;
    this.birthProvinceCode = birthProvinceCode;
    this.birthCountry = birthCountry;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.createdAt = createdAt;
    this.extraTimePercentage = !_.isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    // includes
    // references
    this.sessionId = sessionId;
    this.userId = userId;
  }

  validate(version = '1.2') {
    let usedSchema = null;
    switch (version) {
      case '1.2':
        usedSchema = certificationCandidateValidationJoiSchema_v1_2;
        break;
      case '1.1':
        usedSchema = certificationCandidateValidationJoiSchema_v1_1;
        break;
      default:
        throw new InvalidCertificationCandidate();
    }

    const { error } = usedSchema.validate(this);
    if (error) {
      throw new InvalidCertificationCandidate();
    }
  }

  validateParticipation() {
    const { error } = certificationCandidateParticipationJoiSchema.validate(this);
    if (error) {
      throw error;
    }
  }
}

module.exports = CertificationCandidate;
