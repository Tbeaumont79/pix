import { databaseBuffer } from '../database-buffer.js';

export const buildScoringConfiguration = function ({
  id = databaseBuffer.getNextId(),
  configuration = [
    { bounds: { max: -2.6789, min: -5.12345 }, meshLevel: 0 },
    { bounds: { max: -0.23456, min: -2.6789 }, meshLevel: 1 },
    { bounds: { max: 0.78901, min: -0.23456 }, meshLevel: 2 },
    { bounds: { max: 1.34567, min: 0.78901 }, meshLevel: 3 },
    { bounds: { max: 2.89012, min: 1.34567 }, meshLevel: 4 },
    { bounds: { max: 2.45678, min: 2.89012 }, meshLevel: 5 },
    { bounds: { max: 4.90123, min: 2.45678 }, meshLevel: 6 },
    { bounds: { max: 6.56789, min: 4.90123 }, meshLevel: 7 },
  ],
  createdAt = new Date('2020-01-01'),
  createdByUserId = 123,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'certification-scoring-configurations',
    values: {
      id,
      configuration: JSON.stringify(configuration),
      createdAt,
      createdByUserId,
    },
  });
};
