import { CertifiableProfileForLearningContent } from '../../../../src/shared/domain/models/CertifiableProfileForLearningContent.js';

const buildCertifiableProfileForLearningContent = function ({
  learningContent,
  knowledgeElements,
  answerAndChallengeIdsByAnswerId,
} = {}) {
  return new CertifiableProfileForLearningContent({
    learningContent,
    knowledgeElements,
    answerAndChallengeIdsByAnswerId,
  });
};

export { buildCertifiableProfileForLearningContent };
