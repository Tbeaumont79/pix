import lodash from 'lodash';

import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { AccountRecoveryDemand } from '../../../../../src/identity-access-management/domain/models/AccountRecoveryDemand.js';
import { accountRecoveryDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/account-recovery-demand.repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../test-helper.js';
const { omit } = lodash;

describe('Integration | Identity Access Management | Infrastructure | Repository | account-recovery-demand', function () {
  describe('#findByTemporaryKey', function () {
    context('when demand does not exist', function () {
      it('throws a not found error', async function () {
        // when
        const error = await catchErr(accountRecoveryDemandRepository.findByTemporaryKey)('temporary key not found');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal('No account recovery demand found');
      });
    });

    context('when demand exists', function () {
      context('when demand has been used already', function () {
        it('returns the account recovery demand', async function () {
          // given
          const email = 'someMail@example.net';
          const temporaryKey = 'someTemporaryKey';
          const {
            id: demandId,
            userId,
            organizationLearnerId,
            createdAt,
          } = await databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: true });
          await databaseBuilder.factory.buildAccountRecoveryDemand({ email, used: false });
          await databaseBuilder.commit();
          const expectedAccountRecoveryDemand = {
            id: demandId,
            userId,
            oldEmail: null,
            organizationLearnerId,
            newEmail: 'philipe@example.net',
            temporaryKey: 'someTemporaryKey',
            used: true,
            createdAt,
          };
          // when
          const demand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);

          // then
          expect(demand).to.deep.equal(expectedAccountRecoveryDemand);
        });
      });

      context('when demand is not used yet', function () {
        context('when demand is still valid', function () {
          it('returns the account recovery demand', async function () {
            // given
            const email = 'someMail@example.net';
            const temporaryKey = 'someTemporaryKey';
            const {
              id: demandId,
              userId,
              organizationLearnerId,
              createdAt,
            } = await databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: false });
            await databaseBuilder.factory.buildAccountRecoveryDemand({ email, used: false });
            await databaseBuilder.commit();
            const expectedAccountRecoveryDemand = {
              id: demandId,
              userId,
              oldEmail: null,
              organizationLearnerId,
              newEmail: 'philipe@example.net',
              temporaryKey: 'someTemporaryKey',
              used: false,
              createdAt,
            };
            // when
            const demand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);

            // then
            expect(demand).to.deep.equal(expectedAccountRecoveryDemand);
          });
        });
      });
    });
  });

  describe('#findByUserId', function () {
    context('when there is no demand', function () {
      it('returns an empty array', async function () {
        //given
        const userId = 1;

        // when
        const result = await accountRecoveryDemandRepository.findByUserId(userId);

        // then
        expect(result).to.be.an('array').that.is.empty;
      });
    });

    context('when there are several demands for several users', function () {
      it('returns only the user ones', async function () {
        // given
        databaseBuilder.factory.buildAccountRecoveryDemand();
        const expectedUser = databaseBuilder.factory.buildUser();
        const firstAccountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: expectedUser.id,
          temporaryKey: 'temporaryKey1',
          oldEmail: null,
        });
        const secondAccountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: expectedUser.id,
          used: true,
          temporaryKey: 'temporaryKey2',
          oldEmail: null,
        });

        await databaseBuilder.commit();

        // when
        const result = await accountRecoveryDemandRepository.findByUserId(expectedUser.id);

        // then
        expect(result).to.be.deep.equal([
          omit(firstAccountRecoveryDemand, 'updatedAt'),
          omit(secondAccountRecoveryDemand, 'updatedAt'),
        ]);
      });
    });
  });

  describe('#markAsBeingUsed', function () {
    it('marks demand as used', async function () {
      // given
      const temporaryKey = 'temporaryKey';
      databaseBuilder.factory.buildAccountRecoveryDemand({ temporaryKey, used: false });
      await databaseBuilder.commit();

      // when
      await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey);

      // then
      const demand = await knex('account-recovery-demands').select('used').where({ temporaryKey }).first();
      expect(demand.used).to.be.true;
    });

    it('changes updatedAt', async function () {
      // given
      const temporaryKey = 'temporaryKey';
      const oldUpdatedAt = new Date('2013-01-01T15:00:00Z');
      databaseBuilder.factory.buildAccountRecoveryDemand({ temporaryKey, used: false, updatedAt: oldUpdatedAt });
      await databaseBuilder.commit();

      // when
      await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey);

      // then
      const demand = await knex('account-recovery-demands').where({ temporaryKey }).first();
      const newUpdatedAt = demand.updatedAt;
      expect(newUpdatedAt).to.be.above(oldUpdatedAt);
    });

    context('when an error occurs in transaction', function () {
      it('rollbacks update', async function () {
        // given
        const temporaryKey = 'temporaryKey';
        databaseBuilder.factory.buildAccountRecoveryDemand({ temporaryKey, used: false });
        await databaseBuilder.commit();

        // when
        await catchErr(async () => {
          await DomainTransaction.execute(async () => {
            await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey);
            throw new Error('Error occurs in transaction');
          });
        });

        // then
        const demand = await knex('account-recovery-demands').select('used').where({ temporaryKey }).first();
        expect(demand.used).to.be.false;
      });
    });
  });

  describe('#save', function () {
    it('persists the account recovery demand', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id }).id;
      await databaseBuilder.commit();

      const userId = user.id;
      const newEmail = 'dupont@example.net';
      const oldEmail = 'eleve-dupont@example.net';
      const used = false;
      const temporaryKey = '123456789AZERTYUIO';
      const accountRecoveryDemandAttributes = {
        userId,
        organizationLearnerId,
        newEmail,
        oldEmail,
        used,
        temporaryKey,
      };
      const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand(accountRecoveryDemandAttributes);

      // when
      const result = await accountRecoveryDemandRepository.save(accountRecoveryDemand);

      // then
      const accountRecoveryDemands = await knex('account-recovery-demands').select();
      expect(accountRecoveryDemands).to.have.lengthOf(1);
      expect(result).to.be.instanceOf(AccountRecoveryDemand);
      expect(result.userId).to.equal(userId);
      expect(result.newEmail).to.equal(newEmail);
      expect(result.used).to.equal(used);
      expect(result.temporaryKey).to.equal(temporaryKey);
    });

    context('when no row is saved', function () {
      it('throws an error', async function () {
        // given
        const notValidAccountRecoveryDemand = 123;

        // when
        const error = await catchErr(accountRecoveryDemandRepository.save)(notValidAccountRecoveryDemand);

        // then
        expect(error).to.be.instanceOf(Error);
      });
    });
  });
});
