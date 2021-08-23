const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationResult', function() {

  context('#static from', function() {
    let certificationResultData;

    beforeEach(function() {
      certificationResultData = {
        id: 123,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        isV2Certification: true,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-02'),
        hasSeenEndTestScreen: true,
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        emitter: 'Moi',
        commentForCandidate: 'Un commentaire candidat 1',
        commentForJury: 'Un commentaire jury 1',
        commentForOrganization: 'Un commentaire orga 1',
        juryId: 159,
        competenceMarksJson: '[{ "id":123, "score":10, "level":4, "area_code":2, "competence_code":2.3, "assessmentResultId":753, "competenceId":"recComp23"}]',
      };
    });

    it('should build a CertificationResult from various arguments', function() {
      // given
      const certificationResultDTO = {
        ...certificationResultData,
        isCancelled: false,
        assessmentResultStatus: CertificationResult.status.VALIDATED,
      };
      const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

      // when
      const certificationResult = CertificationResult.from({
        certificationResultDTO,
        certificationIssueReports,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
      });

      // then
      const expectedCertificationResult = domainBuilder.buildCertificationResult({
        id: 123,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        isV2Certification: true,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-02'),
        hasSeenEndTestScreen: true,
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        emitter: 'Moi',
        commentForCandidate: 'Un commentaire candidat 1',
        commentForJury: 'Un commentaire jury 1',
        commentForOrganization: 'Un commentaire orga 1',
        juryId: 159,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
        certificationIssueReports,
        competencesWithMark: [domainBuilder.buildCompetenceMark({
          id: 123,
          level: 4,
          score: 10,
          area_code: '2',
          competence_code: '2.3',
          competenceId: 'recComp23',
          assessmentResultId: 753,
        })],
      });
      expect(certificationResult).to.deepEqualInstance(expectedCertificationResult);
    });

    context('status', function() {

      it('should build a cancelled CertificationResult when certification is cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: true,
          assessmentResultStatus: CertificationResult.status.VALIDATED,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.CANCELLED);
      });

      it('should build a validated CertificationResult when assessmentResultStatus is validated and certification not cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: false,
          assessmentResultStatus: CertificationResult.status.VALIDATED,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.VALIDATED);
      });

      it('should build a rejected CertificationResult when assessmentResultStatus is rejected and certification not cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: false,
          assessmentResultStatus: CertificationResult.status.REJECTED,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.REJECTED);
      });

      it('should build an error CertificationResult when assessmentResultStatus is in error and certification not cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: false,
          assessmentResultStatus: CertificationResult.status.ERROR,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.ERROR);
      });

      it('should build a started CertificationResult when there are no assessmentResultStatus and certification not cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: false,
          assessmentResultStatus: null,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.STARTED);
      });
    });
  });

  context('#isCancelled', function() {

    it('returns true if status is "cancelled"', function() {
      // given
      const cancelledCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.CANCELLED,
      });

      // when / then
      expect(cancelledCertificationResult.isCancelled()).to.be.true;
    });

    it('returns false otherwise', function() {
      for (const status of Object.values(CertificationResult.status)) {
        if (status !== CertificationResult.status.CANCELLED) {
          // given
          const notCancelledCertificationResult = domainBuilder.buildCertificationResult({
            status,
          });

          // when
          const isCancelled = notCancelledCertificationResult.isCancelled();

          // then
          expect(isCancelled).to.equal(false, `should not be cancelled when status is ${status}`);
        }
      }
    });
  });

  context('#isValidated', function() {

    it('returns true if status is "validated"', function() {
      // given
      const validatedCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.VALIDATED,
      });

      // when
      const isValidated = validatedCertificationResult.isValidated();

      // then
      expect(isValidated).to.be.true;
    });

    it('returns false otherwise', function() {
      for (const status of Object.values(CertificationResult.status)) {
        if (status !== CertificationResult.status.VALIDATED) {
          // given
          const notValidatedCertificationResult = domainBuilder.buildCertificationResult({
            status,
          });

          // when
          const isValidated = notValidatedCertificationResult.isValidated();

          // then
          expect(isValidated).to.equal(false, `should not be validated when status is ${status}`);
        }
      }
    });
  });

  context('#isRejected', function() {

    it('returns true if status is "rejected"', function() {
      // given
      const rejectedCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.REJECTED,
      });

      // when
      const isRejected = rejectedCertificationResult.isRejected();

      // then
      expect(isRejected).to.be.true;
    });

    it('returns false otherwise', function() {
      for (const status of Object.values(CertificationResult.status)) {
        if (status !== CertificationResult.status.REJECTED) {
          // given
          const notRejectedCertificationResult = domainBuilder.buildCertificationResult({
            status,
          });

          // when
          const isRejected = notRejectedCertificationResult.isRejected();

          // then
          expect(isRejected).to.equal(false, `should not be rejected when status is ${status}`);
        }
      }
    });
  });

  context('#isInError', function() {

    it('returns true if status is "error"', function() {
      // given
      const errorCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.ERROR,
      });

      // when
      const isInError = errorCertificationResult.isInError();

      // then
      expect(isInError).to.be.true;
    });

    it('returns false otherwise', function() {
      for (const status of Object.values(CertificationResult.status)) {
        if (status !== CertificationResult.status.ERROR) {
          // given
          const notErrorCertificationResult = domainBuilder.buildCertificationResult({
            status,
          });

          // when
          const isInError = notErrorCertificationResult.isInError();

          // then
          expect(isInError).to.equal(false, `should not be in error when status is ${status}`);
        }
      }
    });
  });

  context('#isStarted', function() {

    it('returns true if status is "started"', function() {
      // given
      const startedCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.STARTED,
      });

      // when
      const isStarted = startedCertificationResult.isStarted();

      // then
      expect(isStarted).to.be.true;
    });

    it('returns false otherwise', function() {
      for (const status of Object.values(CertificationResult.status)) {
        if (status !== CertificationResult.status.STARTED) {
          // given
          const notStartedCertificationResult = domainBuilder.buildCertificationResult({
            status,
          });

          // when
          const isStarted = notStartedCertificationResult.isStarted();

          // then
          expect(isStarted).to.equal(false, `should not be started when status is ${status}`);
        }
      }
    });
  });

  context('#hasTakenClea', function() {

    it('returns true when Clea certification has been taken in the certification', async function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.true;
    });

    it('returns false when Clea certification has not been taken in the certification', async function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.false;
    });
  });

  context('#hasAcquiredClea', function() {

    it('returns true when Clea certification has been acquired', async function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasAcquiredClea = certificationResult.hasAcquiredClea();

      // then
      expect(hasAcquiredClea).to.be.true;
    });

    it('returns false when Clea certification has not been acquired', async function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.rejected();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasAcquiredClea = certificationResult.hasAcquiredClea();

      // then
      expect(hasAcquiredClea).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitMaitre', function() {

    it('returns true when Pix plus maitre certification has been taken in the certification', async function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.true;
    });

    it('returns false when Pix plus maitre certification has not been taken in the certification', async function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.false;
    });
  });

  context('#hasAcquiredPixPlusDroitMaitre', function() {

    it('returns true when Pix plus maitre certification has been acquired', async function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasAcquiredPixPlusDroitMaitre = certificationResult.hasAcquiredPixPlusDroitMaitre();

      // then
      expect(hasAcquiredPixPlusDroitMaitre).to.be.true;
    });

    it('returns false when Pix plus maitre certification has not been acquired', async function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasAcquiredPixPlusDroitMaitre = certificationResult.hasAcquiredPixPlusDroitMaitre();

      // then
      expect(hasAcquiredPixPlusDroitMaitre).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitExpert', function() {

    it('returns true when Pix plus droit expert certification has been taken in the certification', async function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasTakenPixPlusDroitExpert = certificationResult.hasTakenPixPlusDroitExpert();

      // then
      expect(hasTakenPixPlusDroitExpert).to.be.true;
    });

    it('returns false when Pix plus droit expert certification has not been taken in the certification', async function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasTakenPixPlusDroitExpert = certificationResult.hasTakenPixPlusDroitExpert();

      // then
      expect(hasTakenPixPlusDroitExpert).to.be.false;
    });
  });

  context('#hasAcquiredPixPlusDroitExpert', function() {

    it('returns true when Pix plus droit expert certification has been acquired', async function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasAcquiredPixPlusDroitExpert = certificationResult.hasAcquiredPixPlusDroitExpert();

      // then
      expect(hasAcquiredPixPlusDroitExpert).to.be.true;
    });

    it('returns false when Pix plus droit expert certification has not been acquired', async function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasAcquiredPixPlusDroitExpert = certificationResult.hasAcquiredPixPlusDroitExpert();

      // then
      expect(hasAcquiredPixPlusDroitExpert).to.be.false;
    });
  });
});
