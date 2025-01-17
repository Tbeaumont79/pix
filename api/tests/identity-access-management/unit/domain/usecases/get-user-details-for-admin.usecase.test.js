import { getUserDetailsForAdmin } from '../../../../../src/identity-access-management/domain/usecases/get-user-details-for-admin.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | get-user-details-for-admin', function () {
  let userRepository;

  beforeEach(function () {
    userRepository = { getUserDetailsForAdmin: sinon.stub() };
  });

  it('gets the user details in administration context', async function () {
    // given
    const userId = 1;
    const expectedUserDetailsForAdmin = { id: userId };

    userRepository.getUserDetailsForAdmin.withArgs(userId).resolves({ id: userId });

    // when
    const result = await getUserDetailsForAdmin({ userId, userRepository });

    // then
    expect(result).to.deep.equal(expectedUserDetailsForAdmin);
  });
});
