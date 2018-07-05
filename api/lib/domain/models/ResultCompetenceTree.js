const Area = require('./Area');
const CompetenceMark = require('./CompetenceMark');
const ResultCompetence = require('./ResultCompetence');

const NOT_PASSED_LEVEL = -1;
const NOT_PASSED_SCORE = 0;

class ResultCompetenceTree {

  constructor({
    id = 1,
    // attributes
    // embedded
    areas = [],
    // relations
  } = {}) {
    this.id = id;
    // attributes
    // embedded
    this.areas = areas;
    // relations
  }

  static generateTreeFromCompetenceMarks({ competenceTree, competenceMarks }) {

    const areasWithResultCompetences = competenceTree.areas.map((area) => {

      const areaWithResultCompetences = new Area(area);

      areaWithResultCompetences.competences = area.competences.map((competence) => {
        const noLevelCompetenceMark = new CompetenceMark({ level: NOT_PASSED_LEVEL, score: NOT_PASSED_SCORE });

        const associatedCompetenceMark = competenceMarks.find((competenceMark) => {
          return competenceMark.competence_code === competence.index;
        }) || noLevelCompetenceMark;

        return new ResultCompetence({
          id: competence.id,
          index: competence.index,
          level: associatedCompetenceMark.level,
          name: competence.name,
          score: associatedCompetenceMark.score,
        });
      });

      return areaWithResultCompetences;
    });

    return new ResultCompetenceTree({ areas: areasWithResultCompetences });
  }
}

module.exports = ResultCompetenceTree;
