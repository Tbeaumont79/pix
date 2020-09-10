const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { allowUnknown: true };

const validationSchema = Joi.array().unique('studentNumber');

module.exports = {
  checkValidation(higherEducationRegistrationSet) {
    const { error } = validationSchema.validate(
      higherEducationRegistrationSet.registrations,
      validationConfiguration,
    );

    if (error) {
      const err = EntityValidationError.fromJoiErrors(error.details);
      err.key = 'studentNumber';
      err.why = 'uniqueness';
      throw err;
    }
  },
};
