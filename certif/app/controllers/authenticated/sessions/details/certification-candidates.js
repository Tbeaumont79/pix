import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import _ from 'lodash';

import config from '../../../../config/environment';

export default Controller.extend({
  session: service(),
  notifications: service('notification-messages'),

  importAllowed: computed('model.certificationCandidates.{[],@each.isLinked}', function() {
    return _.every(this.model.certificationCandidates.toArray(), (certificationCandidate) => {
      return !certificationCandidate.isLinked;
    });
  }),

  _trimOrUndefinedIfFalsy(str) {
    return str ? str.trim() : undefined;
  },

  actions: {
    async importCertificationCandidates(file) {
      const { access_token } = this.get('session.data.authenticated');
      this.notifications.clearAll();

      const autoClear = config.notifications.autoClear;
      const clearDuration = config.notifications.clearDuration;

      try {
        await file.upload(this.model.urlToUpload, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        this.model.certificationCandidates.reload();
        this.notifications.success('La liste des candidats a été importée avec succès', {
          autoClear,
          clearDuration,
        });
      }
      catch (err) {
        const errorDetail = err.body.errors[0].detail ? err.body.errors[0].detail : null;
        if (errorDetail === 'At least one candidate is already linked to a user') {
          this.notifications.error('La session a débuté, il n\'est plus possible de modifier la liste des candidats.', {
            autoClear,
            clearDuration,
          });
        } else {
          this.notifications.error('Une erreur s\'est produite lors de l\'import des candidats', {
            autoClear,
            clearDuration,
          });
        }
      }
    },

    async saveCertificationCandidate(certificationCandidateData) {
      this.notifications.clearAll();
      const autoClear = config.notifications.autoClear;
      const clearDuration = config.notifications.clearDuration;
      const sessionId = this.model.id;
      const certificationCandidate = this.store.createRecord('certification-candidate', {
        firstName: this._trimOrUndefinedIfFalsy(certificationCandidateData.firstName),
        lastName: this._trimOrUndefinedIfFalsy(certificationCandidateData.lastName),
        birthdate: certificationCandidateData.birthdate,
        birthCity: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthCity),
        birthProvinceCode: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthProvinceCode),
        birthCountry: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthCountry),
        externalId: this._trimOrUndefinedIfFalsy(certificationCandidateData.externalId),
        email: this._trimOrUndefinedIfFalsy(certificationCandidateData.email),
        extraTimePercentage: certificationCandidateData.extraTimePercentage,
      });

      try {
        await certificationCandidate
          .save({ adapterOptions: { registerToSession: true, sessionId } });
        this.model.certificationCandidates.pushObject(certificationCandidate);
        this.notifications.success('L\'ajout ou la mise à jour du candidat est un succès.', {
          autoClear,
          clearDuration,
        });
      } catch (err) {
        this.notifications.error('L\'ajout ou la mise à jour du candidat à échoué', {
          autoClear,
          clearDuration,
        });
        return false;
      }

      return true;
    },
  }
});
