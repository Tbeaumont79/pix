const databaseBuffer = require('../database-buffer');

function buildStage({
  id = databaseBuffer.getNextId(),
  message = 'Courage !',
  title = 'Encouragement, il en a bien besoin',
  level = null,
  threshold = 10,
  isFirstSkill = false,
  targetProfileId,
  prescriberTitle = null,
  prescriberDescription = null,
} = {}) {
  const values = {
    id,
    message,
    title,
    level,
    threshold,
    isFirstSkill,
    targetProfileId,
    prescriberTitle,
    prescriberDescription,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'stages',
    values,
  });
}

buildStage.withLevel = function ({
  id,
  message,
  title,
  level = 3,
  isFirstSkill,
  targetProfileId,
  prescriberTitle,
  prescriberDescription,
} = {}) {
  return buildStage({
    id,
    message,
    title,
    level,
    isFirstSkill,
    threshold: null,
    targetProfileId,
    prescriberTitle,
    prescriberDescription,
  });
};

module.exports = buildStage;
