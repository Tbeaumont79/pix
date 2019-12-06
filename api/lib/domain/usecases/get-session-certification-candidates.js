module.exports = function getSessionCertificationCandidates({ sessionId, certificationCandidateRepository }) {
  return certificationCandidateRepository.findBySessionId(sessionId);
};
