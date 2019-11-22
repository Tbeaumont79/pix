import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Component | certification-joiner', function() {

  setupTest();

  describe('#init', function() {
    it('should pad birthdate elements with zeroes', function() {
      const component = this.owner.lookup('component:certification-joiner');
      component.set('yearOfBirth', '2000');
      component.set('monthOfBirth', '1');
      component.set('dayOfBirth', '2');
      expect(component.birthdate).to.equal('2000-01-02');
    });
  });

  describe('#joinCertificationSession', function() {
    it('should trim spaces in first name and last name', async function() {
      // given
      const component = this.owner.lookup('component:certification-joiner');

      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function() {} });

      component.set('store', { createRecord: createRecordMock });
      component.set('firstName', ' Michel ');
      component.set('lastName', ' de Montaigne ');

      // when
      await component.joinCertificationSession();

      // then
      sinon.assert.calledWithMatch(createRecordMock, 'certification-candidate', {
        sessionId: sinon.match.any,
        birthdate: sinon.match.any,
        firstName: 'Michel',
        lastName: 'de Montaigne',
      });
    });
  });
});
