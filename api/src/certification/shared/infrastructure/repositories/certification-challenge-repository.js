import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AssessmentEndedError } from '../../../../shared/domain/errors.js';
import { CertificationChallenge } from '../../../../shared/domain/models/index.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';

const logContext = {
  zone: 'certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId',
  type: 'repository',
};

const save = async function ({ certificationChallenge }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationChallengeToSave = new CertificationChallenge({
    challengeId: certificationChallenge.challengeId,
    competenceId: certificationChallenge.competenceId,
    associatedSkillName: certificationChallenge.associatedSkillName,
    associatedSkillId: certificationChallenge.associatedSkillId,
    courseId: certificationChallenge.courseId,
    certifiableBadgeKey: certificationChallenge.certifiableBadgeKey,
    difficulty: certificationChallenge.difficulty,
    discriminant: certificationChallenge.discriminant,
  });
  const [savedCertificationChallenge] = await knexConn('certification-challenges')
    .insert(certificationChallengeToSave)
    .returning('*')
    .on('query', function (data) {
      logger.info(
        {
          event: 'save-certification-challenge',
        },
        `A certification challenge will be inserted with transaction ${data.__knexTxId}`,
      );
    })
    .on('query-error', function (data) {
      logger.error(
        {
          event: 'save-certification-challenge',
          data: _(data).pick(['code', 'constraint', 'detail']),
        },
        `A certification challenge could not be inserted`,
      );
    });

  return new CertificationChallenge(savedCertificationChallenge);
};

const getNextNonAnsweredChallengeByCourseId = async function (assessmentId, courseId) {
  const answeredChallengeIds = knex('answers').select('challengeId').where({ assessmentId });

  const certificationChallenge = await knex('certification-challenges')
    .where({ courseId })
    .whereNotIn('challengeId', answeredChallengeIds)
    .orderBy('id', 'asc')
    .first();

  if (!certificationChallenge) {
    logger.info(logContext, `no found challenges for certificationCourseId : ${courseId}`);
    throw new AssessmentEndedError();
  }

  logContext.challengeId = certificationChallenge.id;
  logger.trace(logContext, 'found challenge');
  return new CertificationChallenge(certificationChallenge);
};

const getNextChallengeByCourseIdForV3 = async function (courseId, ignoredChallengeIds) {
  const certificationChallenge = await knex('certification-challenges')
    .where({ courseId })
    .whereNotIn('challengeId', ignoredChallengeIds)
    .orderBy('id', 'asc')
    .first();

  if (!certificationChallenge) {
    return null;
  }

  logContext.challengeId = certificationChallenge.id;
  logger.trace(logContext, 'found challenge');

  return new CertificationChallenge(certificationChallenge);
};

export { getNextChallengeByCourseIdForV3, getNextNonAnsweredChallengeByCourseId, save };
