import { Center } from '../../../../src/certification/enrolment/domain/models/Center.js';
import { CenterTypes } from '../../../../src/certification/enrolment/domain/models/CenterTypes.js';

const buildCenter = function ({ id = 1, type = CenterTypes.SUP, habilitations, features } = {}) {
  return new Center({
    id,
    type,
    habilitations,
    features,
  });
};

export { buildCenter };