const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const buildCleaCertificationResult = require('./build-clea-certification-result');
const buildPixPlusDroitCertificationResult = require('./build-pix-plus-droit-certification-result');

const buildCertificationResult = function ({
  id = 123,
  firstName = 'Malik',
  lastName = 'Wayne',
  birthplace = 'Perpignan',
  birthdate = '2000-08-30',
  externalId = 'externalId',
  createdAt = new Date('2020-01-01'),
  sessionId = 789,
  status = CertificationResult.status.REJECTED,
  pixScore = 0,
  commentForOrganization = 'comment organization',
  competencesWithMark = [],
  cleaCertificationResult = buildCleaCertificationResult.notTaken(),
  pixPlusDroitMaitreCertificationResult = buildPixPlusDroitCertificationResult.maitre.notTaken(),
  pixPlusDroitExpertCertificationResult = buildPixPlusDroitCertificationResult.expert.notTaken(),
} = {}) {
  return new CertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  });
};

buildCertificationResult.validated = function ({
  id,
  firstName,
  lastName,
  birthplace,
  birthdate,
  externalId,
  createdAt,
  sessionId,
  pixScore,
  commentForOrganization,
  competencesWithMark,
  cleaCertificationResult,
  pixPlusDroitMaitreCertificationResult,
  pixPlusDroitExpertCertificationResult,
}) {
  return buildCertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status: CertificationResult.status.VALIDATED,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  });
};

buildCertificationResult.rejected = function ({
  id,
  firstName,
  lastName,
  birthplace,
  birthdate,
  externalId,
  createdAt,
  sessionId,
  pixScore,
  commentForOrganization,
  competencesWithMark,
  cleaCertificationResult,
  pixPlusDroitMaitreCertificationResult,
  pixPlusDroitExpertCertificationResult,
}) {
  return buildCertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status: CertificationResult.status.REJECTED,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  });
};

buildCertificationResult.cancelled = function ({
  id,
  firstName,
  lastName,
  birthplace,
  birthdate,
  externalId,
  createdAt,
  sessionId,
  pixScore,
  commentForOrganization,
  competencesWithMark,
  cleaCertificationResult,
  pixPlusDroitMaitreCertificationResult,
  pixPlusDroitExpertCertificationResult,
}) {
  return buildCertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status: CertificationResult.status.CANCELLED,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  });
};

buildCertificationResult.error = function ({
  id,
  firstName,
  lastName,
  birthplace,
  birthdate,
  externalId,
  createdAt,
  sessionId,
  pixScore,
  commentForOrganization,
  competencesWithMark,
  cleaCertificationResult,
  pixPlusDroitMaitreCertificationResult,
  pixPlusDroitExpertCertificationResult,
}) {
  return buildCertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status: CertificationResult.status.ERROR,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  });
};

module.exports = buildCertificationResult;
