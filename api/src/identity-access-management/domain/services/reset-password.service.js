import crypto from 'node:crypto';

import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../shared/config.js';
import * as passwordResetDemandRepository from '../../infrastructure/repositories/reset-password-demand.repository.js';

const generateTemporaryKey = function () {
  return jsonwebtoken.sign(
    {
      data: crypto.randomBytes(16).toString('base64'),
    },
    config.temporaryKey.secret,
    { expiresIn: config.temporaryKey.tokenLifespan },
  );
};

const invalidateOldResetPasswordDemand = function (
  userEmail,
  resetPasswordDemandRepository = passwordResetDemandRepository,
) {
  return resetPasswordDemandRepository.markAsBeingUsed(userEmail);
};

const verifyDemand = function (temporaryKey, resetPasswordDemandRepository = passwordResetDemandRepository) {
  return resetPasswordDemandRepository.findByTemporaryKey(temporaryKey).then((fetchedDemand) => fetchedDemand.toJSON());
};

/**
 * @callback hasUserAPasswordResetDemandInProgress
 * @param {string} email
 * @param {string} temporaryKey
 * @param {ResetPasswordDemandRepository} resetPasswordDemandRepository
 * @return {Promise<*>}
 */
const hasUserAPasswordResetDemandInProgress = function (
  email,
  temporaryKey,
  resetPasswordDemandRepository = passwordResetDemandRepository,
) {
  return resetPasswordDemandRepository.findByUserEmail(email, temporaryKey);
};

/**
 * @typedef {Object} ResetPasswordService
 * @property generateTemporaryKey
 * @property hasUserAPasswordResetDemandInProgress
 * @property invalidateOldResetPasswordDemand
 * @property verifyDemand
 */
export { generateTemporaryKey, hasUserAPasswordResetDemandInProgress, invalidateOldResetPasswordDemand, verifyDemand };
