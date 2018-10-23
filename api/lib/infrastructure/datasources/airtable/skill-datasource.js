const airtable = require('../../airtable');
const { Skill: { fromAirTableObject } } = require('./objects');

const _ = require('lodash');

const AIRTABLE_TABLE_NAME = 'Acquis';

function _doQuery(filter) {
  return airtable.findRecords(AIRTABLE_TABLE_NAME)
    .then((rawSkills) => {
      return _.filter(rawSkills, filter)
        .map(fromAirTableObject);
    });
}

module.exports = {
  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then(fromAirTableObject);
  },

  findByRecordIds(skillRecordIds) {
    return _doQuery((rawSkill) => _.includes(skillRecordIds, rawSkill.id));
  },

  findByCompetenceId(competenceId) {
    return _doQuery((rawSkill) => _.includes(rawSkill.fields['Compétence'], competenceId));
  },

  list() {
    return _doQuery({});
  }
};
