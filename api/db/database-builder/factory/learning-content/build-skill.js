import { databaseBuffer } from '../../database-buffer.js';

export function buildSkill({
  id = 'skillIdA',
  name = 'name Acquis A',
  status = 'status Acquis A',
  pixValue = 2.9,
  version = 5,
  level = 2,
  hintStatus = 'hintStatus Acquis A',
  competenceId = 'competenceIdA',
  tubeId = 'tubeIdA',
  tutorialIds = ['tutorialIdA'],
  learningMoreTutorialIds = [],
} = {}) {
  const values = {
    id,
    name,
    status,
    pixValue,
    version,
    level,
    hintStatus,
    competenceId,
    tubeId,
    tutorialIds,
    learningMoreTutorialIds,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.skills',
    values,
  });
}
