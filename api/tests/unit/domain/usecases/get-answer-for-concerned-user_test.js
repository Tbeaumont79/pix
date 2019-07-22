const { expect, sinon } = require('../../../test-helper');
const getAnswerForConcernedUser = require('../../../../lib/domain/usecases/get-answer-for-concerned-user');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-answer-for-concerned-user', () => {

  const answerId = 1;
  const userId = 'userId';
  let answerRepository, assessmentRepository;

  beforeEach(() => {
    const answer = {
      id: 1,
      assessmentId: 3,
    };
    const assessment = {
      id: 3,
      userId: userId,
    };

    answerRepository = {
      get: sinon.stub(),
    };

    assessmentRepository = {
      get: sinon.stub(),
    };

    answerRepository.get.withArgs(answerId).resolves(answer);
    assessmentRepository.get.withArgs(answer.assessmentId).resolves(assessment);
  });

  context('when user asked for answer is the user of the assessment', () => {
    it('should get the answer', () => {

      // when
      const result = getAnswerForConcernedUser({ answerId, userId, answerRepository, assessmentRepository });

      // then
      return result.then((resultAnswer) => {
        expect(resultAnswer.id).to.equal(answerId);
      });
    });
  });

  context('when user asked for answer is not the user of the assessment', () => {
    it('should throw a Forbidden Access error', () => {

      // when
      const result = getAnswerForConcernedUser({ answerId, userId: userId + 1 , answerRepository, assessmentRepository });

      // then
      return expect(result).to.be.rejectedWith(ForbiddenAccess);
    });
  });

});
