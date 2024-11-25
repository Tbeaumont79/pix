import { competenceDatasource } from '../../../../../../src/shared/infrastructure/datasources/learning-content/index.js';
import { expect, mockLearningContent } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Datasource | Learning Content | CompetenceDatasource', function () {
  describe('#findByRecordIds', function () {
    it('should return an array of matching competence data objects', async function () {
      // given
      const rawCompetence1 = { id: 'RECORD_ID_RAW_COMPETENCE_1' };
      const rawCompetence2 = { id: 'RECORD_ID_RAW_COMPETENCE_2' };
      const rawCompetence3 = { id: 'RECORD_ID_RAW_COMPETENCE_3' };
      const rawCompetence4 = { id: 'RECORD_ID_RAW_COMPETENCE_4' };

      const records = [rawCompetence1, rawCompetence2, rawCompetence3, rawCompetence4];
      await mockLearningContent({ competences: records });
      const expectedCompetenceIds = [rawCompetence1.id, rawCompetence2.id, rawCompetence4.id];

      // when
      const foundCompetences = await competenceDatasource.findByRecordIds(expectedCompetenceIds);
      // then
      expect(foundCompetences.map(({ id }) => id)).to.deep.equal(expectedCompetenceIds);
    });

    it('should return an empty array when there are no objects matching the ids', async function () {
      // given
      const rawCompetence1 = { id: 'RECORD_ID_RAW_COMPETENCE_1' };

      const records = [rawCompetence1];
      await mockLearningContent({ competences: records });

      // when
      const foundCompetences = await competenceDatasource.findByRecordIds(['some_other_id']);

      // then
      expect(foundCompetences).to.be.empty;
    });
  });
});
