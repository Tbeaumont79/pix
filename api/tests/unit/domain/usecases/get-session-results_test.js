const { expect, sinon, domainBuilder } = require('../../../test-helper');
const cleaCertificationStatusRepository = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const getSessionResults = require('../../../../lib/domain/usecases/get-session-results');

describe('Unit | Domain | Use Cases | get-session-results', () => {

  const sessionWith2Candidates = domainBuilder.buildSession();
  const sessionId = sessionWith2Candidates.id;
  const certificationCourseRepository = {};
  const sessionRepositoryStub = {};
  const certifCourse1 = domainBuilder.buildCertificationCourse();
  const certifCourse2 = domainBuilder.buildCertificationCourse();
  const certifCourse3 = domainBuilder.buildCertificationCourse();

  const cleaCertifications = [ 'acquired', 'rejected', 'not_passed'];
  const assessmentsIds = [ 1, 2, 3 ];

  const assessmentResult1 = domainBuilder.buildAssessmentResult({ pixScore: 500, competenceMarks: [], createdAt: 'lundi' });
  const assessmentResult2 = domainBuilder.buildAssessmentResult({ pixScore: 10, competenceMarks: [], createdAt: 'mardi', commentForCandidate: 'Son ordinateur a explosé' });
  const assessmentResult3 = domainBuilder.buildAssessmentResult({ pixScore: 400, competenceMarks: [], createdAt: 'mercredi' });

  const firstCertifResult = _buildCertificationResult(certifCourse1, assessmentResult1, cleaCertifications[0]);
  const secondCertifResult = _buildCertificationResult(certifCourse2, assessmentResult2, cleaCertifications[1]);
  const thirdCertifResult = _buildCertificationResult(certifCourse3, assessmentResult3, cleaCertifications[2]);

  beforeEach(() => {
    // given
    sessionRepositoryStub.get = sinon.stub().withArgs(sessionId).resolves(sessionWith2Candidates);

    certificationCourseRepository.findCertificationCoursesBySessionId = sinon.stub().withArgs({ sessionId }).resolves([certifCourse1, certifCourse2, certifCourse3]);

    const cleaCertificationStatusRepositoryStub = sinon.stub(cleaCertificationStatusRepository, 'getCleaCertificationStatus');
    cleaCertificationStatusRepositoryStub.withArgs(certifCourse1.id).resolves(cleaCertifications[0]);
    cleaCertificationStatusRepositoryStub.withArgs(certifCourse2.id).resolves(cleaCertifications[1]);
    cleaCertificationStatusRepositoryStub.withArgs(certifCourse3.id).resolves(cleaCertifications[2]);

    const assessmentRepositoryStub = sinon.stub(assessmentRepository, 'getIdByCertificationCourseId');
    assessmentRepositoryStub.withArgs(certifCourse1.id).resolves(assessmentsIds[0]);
    assessmentRepositoryStub.withArgs(certifCourse2.id).resolves(assessmentsIds[1]);
    assessmentRepositoryStub.withArgs(certifCourse3.id).resolves(assessmentsIds[2]);

    const assessmentResultRepositoryStub = sinon.stub(assessmentResultRepository, 'findLatestByCertificationCourseIdWithCompetenceMarks');
    assessmentResultRepositoryStub.withArgs({ certificationCourseId: certifCourse1.id }).resolves(assessmentResult1);
    assessmentResultRepositoryStub.withArgs({ certificationCourseId: certifCourse2.id }).resolves(assessmentResult2);
    assessmentResultRepositoryStub.withArgs({ certificationCourseId: certifCourse3.id }).resolves(assessmentResult3);
  });

  it('should return all certification results', async () => {
    // when
    const { session, certificationResults } = await getSessionResults({
      sessionId,
      sessionRepository: sessionRepositoryStub,
      certificationCourseRepository,
    });

    // then
    const expectedSession = sessionWith2Candidates;
    const expectedCertifResults = [ firstCertifResult, secondCertifResult, thirdCertifResult ];
    expect(session).to.deep.equal(expectedSession);
    expect(certificationResults).to.deep.equal(expectedCertifResults);
  });

});

function _buildCertificationResult(certifCourse, assessmentResult, cleaCertification) {
  return domainBuilder.buildCertificationResult({
    ...certifCourse,
    assessmentId: assessmentResult.assessmentId,
    pixScore: assessmentResult.pixScore,
    commentForCandidate: assessmentResult.commentForCandidate,
    commentForJury: assessmentResult.commentForJury,
    commentForOrganization: assessmentResult.commentForOrganization,
    emitter: assessmentResult.emitter,
    resultCreatedAt: assessmentResult.createdAt,
    juryId: assessmentResult.juryId,
    status: assessmentResult.status,
    cleaCertificationStatus: cleaCertification,
    competencesWithMark: [],
  });
}
