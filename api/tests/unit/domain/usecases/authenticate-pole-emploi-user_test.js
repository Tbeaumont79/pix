const { expect, sinon } = require('../../../test-helper');

const authenticatePoleEmploiUser = require('../../../../lib/domain/usecases/authenticate-pole-emploi-user');

const User = require('../../../../lib/domain/models/User');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

const moment = require('moment');

describe('Unit | Application | Use Case | authenticate-pole-emploi-user', () => {

  const code = 'code';
  const redirectUri = 'redirectUri';
  const clientId = 'clientId';

  const accessToken = 'accessToken';
  const idToken = 'idToken';
  const expiresIn = 60;
  const refreshToken = 'refreshToken';

  const firstName = 'firstname';
  const lastName = 'lastname';
  const externalIdentityId = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

  const userId = 1;
  const domainTransaction = Symbol();

  let authenticationService;
  let tokenService;

  let userRepository;
  let authenticationMethodRepository;

  let userInfo;

  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now());
    userInfo = {
      family_name: lastName,
      given_name: firstName,
      externalIdentityId,
    };

    authenticationService = {
      generateAccessToken: sinon.stub().resolves({ accessToken, idToken, expiresIn, refreshToken }),
      getPoleEmploiUserInfo: sinon.stub().resolves(userInfo),
    };

    tokenService = {
      createAccessTokenFromUser: sinon.stub().returns(),
    };

    userRepository = {
      create: sinon.stub().resolves({ id: userId }),
      findByPoleEmploiExternalIdentifier: sinon.stub().resolves(),
    };

    authenticationMethodRepository = {
      create: sinon.stub().resolves(),
      updatePoleEmploiAuthenticationComplementByUserId: sinon.stub().resolves(),
    };

    DomainTransaction.execute = (lambda) => { return lambda(domainTransaction); };
  });

  afterEach(() => {
    clock.restore();
  });

  it('should call authenticate pole emploi user with code, redirectUri and clientId parameters', async () => {
    // when
    await authenticatePoleEmploiUser({
      code, redirectUri, clientId,
      userRepository, authenticationMethodRepository, authenticationService, tokenService,
    });

    // then
    expect(authenticationService.generateAccessToken).to.have.been.calledWith({ code, redirectUri, clientId });
  });

  it('should call get pole emploi user info with id token parameter', async () => {
    // when
    await authenticatePoleEmploiUser({
      code, redirectUri, clientId,
      userRepository, authenticationMethodRepository, authenticationService, tokenService,
    });

    // then
    expect(authenticationService.getPoleEmploiUserInfo).to.have.been.calledWith(idToken);
  });

  context('When user does not exist yet', () => {

    it('should call user repository create function with firstname, lastname and a domain transaction', async () => {
      // given
      const userInfo = {
        firstName, lastName, externalIdentityId,
      };
      authenticationService.getPoleEmploiUserInfo.resolves(userInfo);
      userRepository.findByPoleEmploiExternalIdentifier.resolves(null);

      // when
      await authenticatePoleEmploiUser({
        code, redirectUri, clientId,
        userRepository, authenticationMethodRepository, authenticationService, tokenService,
      });

      // then
      expect(userRepository.create).to.have.been.calledWithMatch({ firstName, lastName }, domainTransaction);
    });

    it('should call authentication method repository create function pole emploi authentication method and domain transaction', async () => {
      // given
      const userInfo = {
        firstName, lastName, externalIdentityId,
      };

      authenticationService.getPoleEmploiUserInfo.resolves(userInfo);
      userRepository.findByPoleEmploiExternalIdentifier.resolves(null);
      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
        externalIdentifier: externalIdentityId,
        authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
          accessToken,
          refreshToken,
          expiredDate: moment().add(expiresIn, 's').toDate(),
        }),
        userId,
      });

      // when
      await authenticatePoleEmploiUser({
        code, redirectUri, clientId,
        userRepository, authenticationMethodRepository, authenticationService, tokenService,
      });

      // then
      expect(authenticationMethodRepository.create).to.have.been.calledWith({ authenticationMethod: expectedAuthenticationMethod, domainTransaction });
    });
  });

  context('When user already exists', () => {

    it('should not call user repository create function', async () => {
      // given
      userRepository.findByPoleEmploiExternalIdentifier.resolves({ id: 1 });

      // when
      await authenticatePoleEmploiUser({
        code, redirectUri, clientId,
        userRepository, authenticationMethodRepository, authenticationService, tokenService,
      });

      // then
      expect(userRepository.create).to.not.have.been.called;
    });

    it('should call authentication repository updatePoleEmploiAuthenticationComplementByUserId function', async () => {
      // given
      userRepository.findByPoleEmploiExternalIdentifier.resolves({ id: 1 });
      const expectedAuthenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
        accessToken,
        refreshToken,
        expiredDate: moment().add(expiresIn, 's').toDate(),
      });

      // when
      await authenticatePoleEmploiUser({
        code, redirectUri, clientId,
        userRepository, authenticationMethodRepository, authenticationService, tokenService,
      });

      // then
      expect(authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId).to.have.been.calledWith({ authenticationComplement: expectedAuthenticationComplement, userId });
    });
  });

  it('should call tokenService createAccessTokenFromUser function with external source and user parameters', async () => {
    // given
    const user = new User({ firstName, lastName });
    user.externalIdentityId = externalIdentityId;

    userRepository.findByPoleEmploiExternalIdentifier.resolves(user);

    // when
    await authenticatePoleEmploiUser({
      code, redirectUri, clientId,
      userRepository, authenticationMethodRepository, authenticationService, tokenService,
    });

    // then
    expect(tokenService.createAccessTokenFromUser).to.have.been.calledWith(user, 'pole_emploi_connect');
  });

  it('should return accessToken and idToken', async () => {
    // given
    const expectedResult = {
      access_token: accessToken,
      id_token: idToken,
    };

    tokenService.createAccessTokenFromUser.returns(accessToken);

    // when
    const result = await authenticatePoleEmploiUser({
      code, redirectUri, clientId,
      userRepository, authenticationMethodRepository, authenticationService, tokenService,
    });

    // then
    expect(result).to.deep.equal(expectedResult);
  });

});
