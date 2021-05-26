const Session = require('../../../../lib/domain/models/Session');

const buildSession = function({
  id = 123,
  accessCode = 'ABCD123',
  address = '4 avenue du général perlimpimpim',
  certificationCenter = 'Centre de certif pix',
  certificationCenterId,
  date = '2021-01-01',
  description = 'Bonne année',
  examiner = 'Flute',
  room = '28D',
  time = '14:30',
  examinerGlobalComment = '',
  finalizedAt = null,
  resultsSentToPrescriberAt = null,
  publishedAt = null,
  assignedCertificationOfficerId,
  certificationCandidates = [],
} = {}) {
  return new Session({
    id,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
    certificationCandidates,
  });
};

buildSession.created = function({
  id,
  accessCode,
  address,
  certificationCenter,
  certificationCenterId,
  date,
  description,
  examiner,
  room,
  time,
  certificationCandidates,
} = {}) {
  return buildSession({
    id,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    certificationCandidates,
    examinerGlobalComment: null,
    finalizedAt: null,
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: null,
  });
};

buildSession.finalized = function({
  id,
  accessCode,
  address,
  certificationCenter,
  certificationCenterId,
  date,
  description,
  examiner,
  room,
  time,
  certificationCandidates,
} = {}) {
  return buildSession({
    id,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    certificationCandidates,
    examinerGlobalComment: null,
    finalizedAt: new Date('2020-01-01'),
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: null,
  });
};

buildSession.inProcess = function({
  id,
  accessCode,
  address,
  certificationCenter,
  certificationCenterId,
  date,
  description,
  examiner,
  room,
  time,
  certificationCandidates,
} = {}) {
  return buildSession({
    id,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    certificationCandidates,
    examinerGlobalComment: null,
    finalizedAt: new Date('2020-01-01'),
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: 123,
  });
};

buildSession.processed = function({
  id,
  accessCode,
  address,
  certificationCenter,
  certificationCenterId,
  date,
  description,
  examiner,
  room,
  time,
  certificationCandidates,
} = {}) {
  return buildSession({
    id,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    certificationCandidates,
    examinerGlobalComment: null,
    finalizedAt: new Date('2020-01-01'),
    resultsSentToPrescriberAt: new Date('2020-01-02'),
    publishedAt: new Date('2020-01-02'),
    assignedCertificationOfficerId: 123,
  });
};

module.exports = buildSession;
