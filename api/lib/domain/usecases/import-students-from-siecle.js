const { FileValidationError, ObjectAlreadyExisting } = require('../errors');
const _ = require('lodash');

module.exports = async function importStudentsFromSIECLE({ organizationId, buffer, studentsXmlService, studentRepository }) {
  const students = studentsXmlService.extractStudentsInformationFromSIECLE(buffer);

  if (_.isEmpty(students)) {
    throw new FileValidationError('Aucun élève n\'a pu être importé depuis ce fichier. Vérifiez sa conformité.');
  }

  const nationalStudentsIds = students.map((student) => student.nationalStudentId);

  if (await studentRepository.checkIfAtLeastOneStudentHasAlreadyBeenImported(nationalStudentsIds)) {
    throw new ObjectAlreadyExisting('La mise à jour de la liste n\'a pas été réalisée. Le fichier contient des élèves déjà importés.');
  }

  const studentsWithOrganizationId = students.map((student) => ({ ...student, organizationId }));

  return studentRepository.batchSave(studentsWithOrganizationId);
};
