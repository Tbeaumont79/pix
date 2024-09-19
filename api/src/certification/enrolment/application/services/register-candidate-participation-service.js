/**
 * @typedef {import ('./index.js').EnrolledCandidateRepository} EnrolledCandidateRepository
 */

import { usecases } from '../../domain/usecases/index.js';

/**
 * Candidate entry to a certification is a multi step process
 * @param {Object} params
 * @param {EnrolledCandidateRepository} params.enrolledCandidateRepository
 * @returns {Promise<EnrolledCandidate>}
 */
export const registerCandidateParticipation = async ({
  userId,
  sessionId,
  firstName,
  lastName,
  birthdate,
  normalizeStringFnc,
  enrolledCandidateRepository,
}) => {
  const candidate = await usecases.verifyCandidateIdentity({
    userId,
    sessionId,
    firstName,
    lastName,
    birthdate,
    normalizeStringFnc,
  });

  if (!candidate.isLinkedToAUser()) {
    await usecases.linkUserToCandidate({
      userId,
      candidate,
    });
  }

  return enrolledCandidateRepository.get({ id: candidate.id });
};
